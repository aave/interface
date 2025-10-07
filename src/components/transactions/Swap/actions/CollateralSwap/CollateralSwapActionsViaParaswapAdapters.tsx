import { Trans } from '@lingui/macro';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { Dispatch, useEffect, useMemo } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { calculateSignedAmount, ExactInSwapper, ExactOutSwapper } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { isParaswapRates, isProtocolSwapState, SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

export const CollateralSwapActionsViaParaswapAdapters = ({
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
  const { setTxError, setMainTxState, approvalTxState } = useModalContext();
  const { addTransaction, estimateGasLimit } = useRootStore();
  const { sendTx } = useWeb3Context();
  const [swapCollateral, currentMarketData] = useRootStore(
    useShallow((state) => [state.swapCollateral, state.currentMarketData])
  );

  // Approval is aToken ERC20 Approval
  const amountToApprove = useMemo(
    () => calculateSignedAmount(state.inputAmount, state.sourceToken.decimals),
    [state.inputAmount, state.sourceToken.decimals]
  );
  const { requiresApproval, signatureParams, approval, tryPermit } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.sourceToken.addressToSwap, // aToken
    symbol: state.sourceToken.symbol,
    amount: amountToApprove,
    decimals: state.sourceToken.decimals,
    spender: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
    setState,
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
    if (!state.swapRate || !isParaswapRates(state.swapRate))
      throw new Error('Route required to build transaction');

    const slippageInPercent = (Number(state.slippage) * 100).toString();
    const isMaxSelected = state.inputAmount === state.sourceToken.balance;
    const optimalRateData = state.swapRate.optimalRateData;
    const maxSlippage = Number(slippageInPercent);

    // 1. Prepare internal swap call data
    let swapCallData = '';
    let augustus = '';
    if (state.side === 'sell') {
      const swapper = ExactInSwapper(state.chainId);
      const result = await swapper.getTransactionParams(
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.user,
        optimalRateData,
        maxSlippage
      );
      swapCallData = result.swapCallData;
      augustus = result.augustus;
    } else if (state.side === 'buy') {
      const swapper = ExactOutSwapper(state.chainId);
      const result = await swapper.getTransactionParams(
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.user,
        optimalRateData,
        maxSlippage
      );
      swapCallData = result.swapCallData;
      augustus = result.augustus;
    }

    if (!isProtocolSwapState(state)) throw new Error('State is not a protocol swap state');

    // 2. Prepare Tx
    const txs = await swapCollateral({
      amountToSwap: state.inputAmount,
      amountToReceive: state.minimumReceived || '0',
      poolReserve: state.sourceReserve.reserve,
      targetReserve: state.destinationReserve.reserve,
      isWrongNetwork: state.isWrongNetwork,
      symbol: state.sourceToken.symbol,
      blocked: state.actionsBlocked,
      isMaxSelected: isMaxSelected,
      useFlashLoan: true,
      swapCallData: swapCallData,
      augustus: augustus,
      signature: signatureParams?.signature,
      deadline: signatureParams?.deadline,
      signedAmount: amountToApprove,
    });

    const actionTx = txs.find((tx) => ['DLP_ACTION'].includes(tx.txType));
    if (!actionTx) throw new Error('Action tx not found');
    const tx = await actionTx.tx();
    const populatedTx: PopulatedTransaction = {
      to: tx.to,
      from: tx.from,
      data: tx.data,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      nonce: tx.nonce,
      chainId: tx.chainId,
      value: tx.value ? BigNumber.from(tx.value) : undefined,
    };

    // 3. Estimate gas limit and send tx
    const txWithGasEstimation = await estimateGasLimit(populatedTx, state.chainId);
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
      sx={{
        mt: 6,
      }}
      mainTxState={state.mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={state.actionsLoading}
      handleAction={action}
      requiresAmount
      amount={state.inputAmount}
      blocked={state.actionsBlocked || approvalTxState.loading}
      handleApproval={approval}
      requiresApproval={requiresApproval}
      actionText={
        approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Swap {state.sourceToken.symbol} collateral</Trans>
        )
      }
      actionInProgressText={<Trans>Swapping {state.sourceToken.symbol} collateral</Trans>}
      fetchingData={state.actionsLoading}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked,
        content: <Trans>Swap {state.sourceToken.symbol} collateral</Trans>,
        handleClick: action,
      }}
      tryPermit={tryPermit}
    />
  );
};
