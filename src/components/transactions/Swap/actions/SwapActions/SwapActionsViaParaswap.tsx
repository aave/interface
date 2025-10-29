import { Trans } from '@lingui/macro';
import { Dispatch, useEffect } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useParaswapSellTxParams } from 'src/hooks/paraswap/useParaswapRates';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { isParaswapRates, SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

/**
 * Simple asset swap via ParaSwap Adapter (non-position flow).
 * Prepares approval if needed and executes the route returned by useSwapQuote.
 */
export const SwapActionsViaParaswap = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [user, estimateGasLimit, addTransaction] = useRootStore(
    useShallow((state) => [state.account, state.estimateGasLimit, state.addTransaction])
  );

  const { mainTxState, loadingTxns, setMainTxState, setTxError, approvalTxState } =
    useModalContext();

  const { sendTx } = useWeb3Context();
  const { mutateAsync: fetchParaswapTxParams } = useParaswapSellTxParams(state.chainId);

  const slippageInPercent = (Number(state.slippage) * 100).toString();

  const { requiresApproval, requiresApprovalReset, signatureParams, approval, tryPermit } =
    useSwapTokenApproval({
      chainId: state.chainId,
      token: state.sourceToken.addressToSwap,
      symbol: state.sourceToken.symbol,
      amount: state.inputAmount,
      decimals: state.sourceToken.decimals,
      spender: isParaswapRates(state.swapRate)
        ? state?.swapRate?.optimalRateData?.tokenTransferProxy
        : undefined,
      setState,
    });

  // Use centralized gas estimation
  useSwapGasEstimation({
    state,
    setState,
    requiresApproval,
    requiresApprovalReset,
    approvalTxState: { success: approvalTxState.success || false },
  });

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    if (isParaswapRates(state.swapRate)) {
      try {
        // Normal switch using paraswap
        const tx = await fetchParaswapTxParams({
          srcToken: state.sourceToken.addressToSwap,
          srcDecimals: state.swapRate.srcDecimals,
          destDecimals: state.swapRate.destDecimals,
          destToken: state.destinationToken.addressToSwap,
          route: state.swapRate.optimalRateData,
          user,
          maxSlippage: Number(slippageInPercent) * 10000,
          permit: signatureParams && signatureParams.signature,
          deadline: signatureParams && signatureParams.deadline,
          partner: 'aave-widget', // TODO: Check with paraswap team if we can change it
        });
        tx.chainId = state.chainId;
        const txWithGasEstimation = await estimateGasLimit(tx, state.chainId);
        const response = await sendTx(txWithGasEstimation);
        try {
          await response.wait(1);
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

          params.invalidateAppState();
          trackingHandlers.trackSwap();
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
          setTxError(parsedError);
          setMainTxState({
            txHash: response.hash,
            loading: false,
          });
          setState({
            actionsLoading: false,
          });
          addTransaction(
            response.hash,
            {
              txState: 'failed',
            },
            {
              chainId: state.chainId,
            }
          );
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
        setState({
          actionsLoading: false,
        });
      }
    } else {
      setTxError(
        getErrorTextFromError(new Error('No sell rates found'), TxAction.MAIN_ACTION, true)
      );
      setState({
        actionsLoading: false,
      });
    }
  };

  // Track execution state to pause rate updates during actions
  useEffect(() => {
    const isExecuting = mainTxState.loading || approvalTxState.loading;

    setState({ actionsLoading: isExecuting });
  }, [mainTxState.loading, approvalTxState.loading, state.actionsLoading]);

  return (
    <TxActionsWrapper
      sx={{
        mt: 6,
      }}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={state.inputAmount}
      handleApproval={() => approval()}
      requiresApproval={!state.actionsBlocked && requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked || (!approvalTxState.success && requiresApproval),
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={state.actionsBlocked}
      tryPermit={tryPermit}
    />
  );
};
