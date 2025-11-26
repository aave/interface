import { normalize } from '@aave/math-utils';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { Dispatch, useEffect, useMemo } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { saveParaswapTxToUserHistory } from 'src/utils/swapAdapterHistory';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { getTransactionParams } from '../../helpers/paraswap';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import {
  areActionsBlocked,
  isParaswapRates,
  ProtocolSwapParams,
  ProtocolSwapState,
  SwapState,
} from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

export const WithdrawAndSwapActionsViaParaswap = ({
  state,
  setState,
  params,
  trackingHandlers,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [withdrawAndSwitch, currentMarketData, estimateGasLimit, addTransaction] = useRootStore(
    useShallow((state) => [
      state.withdrawAndSwitch,
      state.currentMarketData,
      state.estimateGasLimit,
      state.addTransaction,
    ])
  );

  const { approvalTxState, mainTxState, setMainTxState, setTxError } = useModalContext();

  const { sendTx } = useWeb3Context();

  // Approval is aToken ERC20 Approval
  const amountToApprove = useMemo(() => {
    if (!state.sellAmountFormatted || !state.sellAmountToken) return '0';
    return calculateSignedAmount(state.sellAmountFormatted, state.sellAmountToken.decimals);
  }, [state.sellAmountFormatted, state.sellAmountToken]);

  const { requiresApproval, signatureParams, approval, tryPermit, loadingPermitData } =
    useSwapTokenApproval({
      chainId: state.chainId,
      token: state.sourceToken.addressToSwap, // aToken
      symbol: state.sourceToken.symbol,
      amount: normalize(amountToApprove.toString(), state.sourceToken?.decimals ?? 18),
      decimals: state.sourceToken.decimals,
      spender: currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER,
      setState,
      trackingHandlers,
      swapType: state.swapType,
    });

  // Use centralized gas estimation
  useSwapGasEstimation({
    state,
    setState,
    requiresApproval,
    requiresApprovalReset: state.requiresApprovalReset,
    approvalTxState,
  });

  const action = async () => {
    if (!state.swapRate || !isParaswapRates(state.swapRate)) {
      console.error('No swap rate found');
      return;
    }

    try {
      setMainTxState({ ...mainTxState, loading: true });
      const { swapCallData, augustus } = await getTransactionParams(
        state.side,
        state.chainId,
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.user,
        state.swapRate.optimalRateData,
        Number(state.slippage)
      );

      const tx = withdrawAndSwitch({
        poolReserve: state.sourceReserve.reserve,
        targetReserve: state.destinationReserve.reserve,
        isMaxSelected: state.isMaxSelected,
        amountToSwap: state.sellAmountBigInt?.toString() ?? '0',
        amountToReceive: state.buyAmountBigInt?.toString() ?? '0',
        augustus: augustus,
        txCalldata: swapCallData,
        signatureParams: {
          signature: signatureParams?.plain ?? '',
          deadline: signatureParams?.deadline ?? '',
          amount: signatureParams?.amount ?? '',
        },
      });

      const txDataWithGasEstimation = await estimateGasLimit(tx);
      const response = await sendTx(txDataWithGasEstimation);
      await response.wait(1);

      trackingHandlers.trackSwap();
      params.invalidateAppState();
      saveParaswapTxToUserHistory({
        protocol: 'paraswap',
        txHash: response.hash,
        swapType: state.swapType,
        chainId: state.chainId,
        account: state.user,
        timestamp: new Date().toISOString(),
        status: OrderStatus.FULFILLED,
        srcToken: {
          address: state.sourceToken.underlyingAddress,
          symbol: state.sourceToken.symbol,
          name: state.sourceToken.symbol,
          decimals: state.sourceToken.decimals,
        },
        destToken: {
          address: state.destinationToken.underlyingAddress,
          symbol: state.destinationToken.symbol,
          name: state.destinationToken.symbol,
          decimals: state.destinationToken.decimals,
        },
        srcAmount: state.sellAmountBigInt?.toString() ?? '0',
        destAmount: state.buyAmountBigInt?.toString() ?? '0',
      });
      addTransaction(
        response.hash,
        {
          txState: 'success',
        },
        {
          chainId: state.chainId,
        }
      );

      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);

      // For gas estimation errors in Paraswap actions, show as warning instead of blocking error
      if (parsedError.txAction === TxAction.GAS_ESTIMATION) {
        setState({
          actionsLoading: false,
          warnings: [
            {
              message:
                'Gas estimation error: The swap could not be estimated. Try increasing slippage or changing the amount.',
            },
          ],
          error: undefined, // Clear any existing errors
        });
        trackingHandlers.trackGasEstimationError(error);
      } else {
        // For other errors, handle normally
        setTxError(parsedError);
        setState({
          actionsLoading: false,
        });
        const reason = error instanceof Error ? error.message : undefined;
        trackingHandlers.trackSwapFailed(reason);
      }

      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  useEffect(() => {
    if (state.mainTxState.success) {
      trackingHandlers.trackSwap();
      params.invalidateAppState();

      addTransaction(
        state.mainTxState.txHash || '',
        {
          txState: 'success',
        },
        {
          chainId: state.chainId,
        }
      );

      setMainTxState({
        txHash: state.mainTxState.txHash || '',
        loading: false,
        success: true,
      });
    }
  }, [state.mainTxState.success]);

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={state.actionsLoading}
      handleAction={action}
      requiresAmount
      amount={state.processedSide === 'sell' ? state.sellAmountFormatted : state.buyAmountFormatted}
      handleApproval={approval}
      requiresApproval={requiresApproval}
      actionText={<Trans>Withdraw and Swap</Trans>}
      actionInProgressText={<Trans>Withdrawing and Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: areActionsBlocked(state) || !approvalTxState?.success,
        content: <Trans>Withdraw and Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={state.actionsLoading || loadingPermitData}
      blocked={areActionsBlocked(state)}
      tryPermit={tryPermit}
    />
  );
};
