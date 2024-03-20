import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { Contract } from 'ethers';
import React, { useEffect, useState } from 'react';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';
import { getRouterConfig } from './Router';
import routerAbi from './Router-abi.json';

interface TokenAmount {
  token: string;
  amount: string;
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
  message: {
    receiver: string;
    data: string;
    tokenAmounts: TokenAmount[];
    feeToken: string;
    extraArgs: string;
  };
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
    const [walletApprovalMethodPreference, addTransaction, currentMarketData] = useRootStore(
      (state) => [
        state.walletApprovalMethodPreference,
        state.addTransaction,
        state.currentMarketData,
      ]
    );
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

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isFetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = useApprovedAmount({
      marketData: currentMarketData,
      token: tokenAddress,
      spender: getRouterConfig(sourceChain.chainId).address,
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
        spender: getRouterConfig(sourceChain.chainId).address,
      },
      requiresApproval,
      assetAddress: tokenAddress,
      symbol: 'GHO',
      decimals: 18,
      signatureAmount: amountToBridge,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
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

        const signer = await provider.getSigner();

        const sourceRouterAddress = getRouterConfig(sourceChain.chainId).address;
        const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

        const destinationChainSelector = getRouterConfig(destinationChain.chainId).chainSelector;

        console.log(
          `approved router ${sourceRouterAddress} to spend ${amountToBridge} of token ${tokenAddress}.`
        );

        const sendTx: TransactionResponse = await sourceRouter.ccipSend(
          destinationChainSelector,
          message,
          {
            value: fees,
          }
        );

        const receipt = await sendTx.wait();

        // Simulate a call to the router to fetch the messageID
        const call = {
          from: sendTx.from,
          to: sendTx.to,
          data: sendTx.data,
          gasLimit: sendTx.gasLimit,
          gasPrice: sendTx.gasPrice,
          value: sendTx.value,
        };

        // Simulate a contract call with the transaction data at the block before the transaction
        const messageId = await provider.call(call, receipt.blockNumber - 1);

        console.log(
          `\n✅ ${amountToBridge} of Tokens(${tokenAddress}) Sent to account ${destinationAccount} on destination chain ${destinationChain} using CCIP. Transaction hash ${sendTx.hash} -  Message id is ${messageId}`
        );
        // TODO add transaction to the localstorage

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

        // queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
        // refetchPoolData && refetchPoolData();
        // refetchIncentiveData && refetchIncentiveData();
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
        preparingTransactions={loadingTxns}
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
