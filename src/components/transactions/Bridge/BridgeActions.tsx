import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Contract } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import React, { useEffect } from 'react';
import { useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';
import { bridgeGasLimit, getChainSelectorFor, getRouterFor } from './BridgeConfig';
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
  symbol: string;
  blocked: boolean;
  decimals: number;
  sourceChainId: number;
  destinationChainId: number;
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
    tokenAddress,
    sourceChainId,
    destinationChainId,
    message,
    fees,
    ...props
  }: BridgeActionProps) => {
    const { provider } = useWeb3Context();
    const queryClient = useQueryClient();
    const [addTransaction] = useRootStore((state) => [state.addTransaction]);

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

    const {
      data: approvedAmount,
      refetch: fetchApprovedAmount,
      isFetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = useApprovedAmount({
      chainId: sourceChainId,
      token: tokenAddress,
      spender: getRouterFor(sourceChainId),
    });

    setLoadingTxns(fetchingApprovedAmount);

    const requiresApproval =
      Number(amountToBridge) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount ? approvedAmount.toString() : '0',
        amount: amountToBridge,
        signedAmount: '0',
      });

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({});
    }

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
        spender: getRouterFor(sourceChainId),
      },
      requiresApproval,
      assetAddress: tokenAddress,
      symbol: GHO_SYMBOL,
      decimals: 18,
      signatureAmount: amountToBridge,
      onApprovalTxConfirmed: fetchApprovedAmount,
      chainId: sourceChainId,
      amountToApprove: parseUnits(amountToBridge || '0', 18).toString(),
    });

    // Update gas estimation
    useEffect(() => {
      let gasLimit = 0;
      gasLimit = Number(bridgeGasLimit);
      if (requiresApproval && !approvalTxState.success) {
        gasLimit += Number(APPROVAL_GAS_LIMIT);
      }

      setGasLimit(gasLimit.toString());
    }, [requiresApproval, approvalTxState, setGasLimit]);

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        if (!provider) return;

        const signer = provider.getSigner();

        const sourceRouterAddress = getRouterFor(sourceChainId);
        const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

        const destinationChainSelector = getChainSelectorFor(destinationChainId);

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
          action: 'bridge',
          txState: 'success',
          asset: tokenAddress,
          amount: amountToBridge,
          assetName: GHO_SYMBOL,
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
        preparingTransactions={loadingTxns || !fees}
        actionText={<Trans>Bridge {symbol}</Trans>}
        actionInProgressText={<Trans>Bridging {symbol}</Trans>}
        handleApproval={approval}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={false} // permit not availabe
        sx={sx}
        {...props}
      />
    );
  }
);
