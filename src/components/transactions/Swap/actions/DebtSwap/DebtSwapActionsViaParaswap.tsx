import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { parseUnits } from 'ethers/lib/utils';
import { Dispatch } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { maxInputAmountWithSlippage } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { getTransactionParams } from '../../helpers/paraswap';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { isParaswapRates, ProtocolSwapParams, ProtocolSwapState, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

/**
 * Debt swap via ParaSwap Adapter.
 *
 * Flow summary:
 * 1) Approve delegation on the destination variable debt token to the adapter
 * 2) Build a ParaSwap route INVERTED relative to the UI: new debt asset -> old debt asset
 *    - Inversion is required because we're acquiring new debt to repay old debt
 * 3) Call the Debt Switch adapter with swap calldata and permit/delegation signature
 */
export const DebtSwapActionsViaParaswap = ({
  state,
  params,
  setState,
  trackingHandlers,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [currentMarketData, estimateGasLimit, addTransaction, debtSwitch] = useRootStore(
    useShallow((state) => [
      state.currentMarketData,
      state.estimateGasLimit,
      state.addTransaction,
      state.debtSwitch,
    ])
  );
  const { approvalTxState, mainTxState, loadingTxns, setMainTxState, setTxError } =
    useModalContext();
  const { sendTx } = useWeb3Context();

  // TODO: CHECK LIMIT ORDERS BUY ORDERS

  const amountToSwap = maxInputAmountWithSlippage(
    state.buyAmountFormatted ?? '0',
    (Number(state.slippage) * 100).toString(),
    state.destinationReserve.reserve.decimals || 18
  );

  const maxNewDebtAmountToReceiveWithSlippage = maxInputAmountWithSlippage(
    state.outputAmount,
    (Number(state.slippage) * 100).toString(),
    state.destinationReserve.reserve.decimals || 18
  );

  const { requiresApproval, approval, tryPermit, signatureParams } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.destinationReserve.reserve.variableDebtTokenAddress,
    symbol: state.destinationReserve.reserve.symbol,
    amount: maxNewDebtAmountToReceiveWithSlippage,
    decimals: state.destinationReserve.reserve.decimals,
    spender: currentMarketData.addresses.DEBT_SWITCH_ADAPTER,
    setState,
    allowPermit: currentMarketData.v3,
    margin: 0.25,
    type: 'delegation',
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
    try {
      setMainTxState({ ...mainTxState, loading: true });

      if (!state.swapRate || !isParaswapRates(state.swapRate)) {
        throw new Error('No swap rate found');
      }

      if (!signatureParams) {
        throw new Error('Signature params not found');
      }

      const inferredKind = state.swapRate.optimalRateData.side === 'SELL' ? 'sell' : 'buy';

      // CallData for ParaswapRoute, which is inversed to the actual swap (dest -> src)
      const { swapCallData, augustus } = await getTransactionParams(
        inferredKind,
        state.chainId,
        state.destinationToken.addressToSwap,
        state.destinationToken.decimals,
        state.sourceToken.addressToSwap,
        state.sourceToken.decimals,
        state.user,
        state.swapRate.optimalRateData,
        Number(state.slippage)
      );

      // Transaction sent to Paraswap Adapter
      const amountToReceiveForDebtSwitch = parseUnits(
        maxNewDebtAmountToReceiveWithSlippage,
        state.sourceReserve.reserve.decimals
      ).toString();
      const amountToSwapForDebtSwitch = parseUnits(
        amountToSwap,
        state.destinationReserve.reserve.decimals
      ).toString();

      let debtSwitchTxData = debtSwitch({
        poolReserve: state.sourceReserve.reserve,
        targetReserve: state.destinationReserve.reserve,
        amountToReceive: amountToSwapForDebtSwitch,
        amountToSwap: amountToReceiveForDebtSwitch,
        isMaxSelected: state.isMaxSelected,
        txCalldata: swapCallData,
        augustus: augustus,
        signatureParams: {
          signature: signatureParams.splitedSignature,
          deadline: signatureParams.deadline,
          amount: signatureParams.amount,
        },
        isWrongNetwork: state.isWrongNetwork,
      });

      debtSwitchTxData = await estimateGasLimit(debtSwitchTxData);
      const response = await sendTx(debtSwitchTxData);
      await response.wait(1);
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
      addTransaction(response.hash, {
        action: 'debtSwitch',
        txState: 'success',
        previousState: `${state.buyAmountFormatted} variable ${state.sourceReserve.reserve.symbol}`,
        newState: `${state.inputAmount} variable ${state.destinationReserve.reserve.symbol}`,
        amountUsd: valueToBigNumber(
          parseUnits(amountToSwap, state.sourceReserve.reserve.decimals).toString()
        )
          .multipliedBy(state.sourceReserve.reserve.priceInUSD)
          .toString(),
        outAmountUsd: valueToBigNumber(
          parseUnits(
            maxNewDebtAmountToReceiveWithSlippage,
            state.destinationReserve.reserve.decimals
          ).toString()
        )
          .multipliedBy(state.destinationReserve.reserve.priceInUSD)
          .toString(),
      });

      params.invalidateAppState();
      trackingHandlers.trackSwap();
    } catch (error) {
      console.error('error', error);
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setState({
        actionsLoading: false,
      });
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

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
      handleApproval={approval}
      requiresApproval={requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      fetchingData={state.ratesLoading}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked || !approvalTxState?.success,
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      blocked={state.actionsBlocked}
      tryPermit={tryPermit}
    />
  );
};
