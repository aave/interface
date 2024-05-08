import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Contract } from 'ethers';
import React, { useEffect, useState } from 'react';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { MarketDataType } from 'src/utils/marketsAndNetworksConfig';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';
import { getChainSelectorFor, getRouterFor } from './BridgeConfig';
import { getMarketByChainIdWithBridge } from './common';
import routerAbi from './Router-abi.json';

export interface TokenAmount {
  token: string;
  amount: string;
}

export interface MessageDetails {
  receiver: string;
  data: string;
  tokenAmounts: TokenAmount[];
  feeToken: string;
  extraArgs: string;
}

export interface BridgeActionProps extends BoxProps {
  amountToBridge: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
  sourceChain: {
    chainId: number;
  };
  destinationChain: {
    chainId: number;
  };
  destinationAccount: string;
  tokenAddress: string;
  fees: string;
  message: MessageDetails | undefined;
}

export const BridgeActions = React.memo(
  ({
    amountToBridge,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    isWrappedBaseAsset,
    tokenAddress,
    sourceChain,
    destinationChain,
    destinationAccount, // user
    message,
    fees,
    ...props
  }: BridgeActionProps) => {
    const { provider } = useWeb3Context();
    const queryClient = useQueryClient();
    const [walletApprovalMethodPreference, addTransaction] = useRootStore((state) => [
      state.walletApprovalMethodPreference,
      state.addTransaction,
    ]);

    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setApprovalTxState,
      setMainTxState,
      setGasLimit,
      setTxError,
    } = useModalContext();
    const [user] = useRootStore((state) => [state.account]);

    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

    const currentMarket = getMarketByChainIdWithBridge(sourceChain.chainId);

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isFetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = useApprovedAmount({
      marketData: currentMarket as MarketDataType,
      token: tokenAddress,
      spender: getRouterFor(sourceChain.chainId),
    });

    setLoadingTxns(fetchingApprovedAmount);

    const requiresApproval =
      Number(amountToBridge) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount ? approvedAmount.toString() : '0',
        amount: amountToBridge,
        signedAmount: signatureParams ? signatureParams.amount : '0',
      });

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({});
    }

    const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

    useEffect(() => {
      if (!isFetchedAfterMount) {
        fetchApprovedAmount();
      }
    }, [fetchApprovedAmount, isFetchedAfterMount]);

    const { approval } = useApprovalTx({
      usePermit: false,
      approvedAmount: {
        amount: approvedAmount?.toString() || '0',
        user: user,
        token: tokenAddress,
        spender: getRouterFor(sourceChain.chainId),
      },
      requiresApproval,
      assetAddress: tokenAddress,
      symbol: 'GHO',
      decimals: 18,
      signatureAmount: amountToBridge,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
      chainId: sourceChain.chainId,
    });

    // Update gas estimation
    useEffect(() => {
      let supplyGasLimit = 0;
      if (usePermit) {
        supplyGasLimit = Number(
          gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended
        );
      } else {
        supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
        if (requiresApproval && !approvalTxState.success) {
          supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
        }
      }
      setGasLimit(supplyGasLimit.toString());
    }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        if (!provider) return;

        const signer = provider.getSigner();

        const sourceRouterAddress = getRouterFor(sourceChain.chainId);
        const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

        const destinationChainSelector = getChainSelectorFor(destinationChain.chainId);

        const sendTx: TransactionResponse = await sourceRouter.ccipSend(
          destinationChainSelector,
          message,
          {
            value: fees,
          }
        );

        await sendTx.wait(1);

        queryClient.invalidateQueries({ queryKey: ['sendRequests', user] });

        setMainTxState({
          txHash: sendTx.hash,
          loading: false,
          success: true,
        });

        addTransaction(sendTx.hash, {
          action: ProtocolAction.default, // TODO bridge action
          txState: 'success',
          asset: tokenAddress,
          amount: amountToBridge,
          assetName: 'GHO',
        });

        setTxError(undefined);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToBridge}
        symbol={symbol}
        // preparingTransactions={loadingTxns}
        preparingTransactions={loadingTxns || !fees}
        actionText={<Trans>Bridge {symbol}</Trans>}
        actionInProgressText={<Trans>Bridging {symbol}</Trans>}
        handleApproval={approval}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={false} // how to check permitAvailable for gho?
        sx={sx}
        {...props}
      />
    );
  }
);
