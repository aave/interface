import { normalizeBN } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { Dispatch, useEffect } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { ExactInSwapper, ExactOutSwapper } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { isParaswapRates, isProtocolSwapState, SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';
// import { normalizeBN } from '@aave/math-utils';

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
  const { requiresApproval, signatureParams, approval, tryPermit, approvedAmount } =
    useSwapTokenApproval({
      chainId: state.chainId,
      token: state.sourceToken.addressToSwap, // aToken
      symbol: state.sourceToken.symbol,
      amount: normalizeBN(state.inputAmount, -state.sourceToken.decimals).toString(),
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

    setMainTxState({
      txHash: undefined,
      loading: true,
    });
    const isMaxSelected = state.isMaxSelected;
    const optimalRateData = state.swapRate.optimalRateData;

    // 1. Prepare internal swap call data
    let swapCallData = '';
    let augustus = '';
    if (state.side === 'sell') {
      const swapper = ExactInSwapper(state.chainId);

      console.log('SWAPPER getTransactionParams');
      console.log('maxSlippage', Number(state.slippage));

      const result = await swapper.getTransactionParams(
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.user,
        optimalRateData,
        Number(state.slippage)
      );
      console.log('SWAPPER getTransactionParams result', result);
      swapCallData = result.swapCallData;
      augustus = result.augustus;
    } else {
      const swapper = ExactOutSwapper(state.chainId);
      console.log('optimalRateData', optimalRateData, {
        srcToken: state.destinationToken.underlyingAddress,
        srcDecimals: state.destinationToken.decimals,
        destToken: state.sourceToken.underlyingAddress,
        destDecimals: state.sourceToken.decimals,
        user: state.user,
        maxSlippage: Number(state.slippage),
        optimalRateData: optimalRateData,
      });

      const result = await swapper.getTransactionParams(
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.user,
        optimalRateData,
        Number(state.slippage)
      );
      swapCallData = result.swapCallData;
      augustus = result.augustus;
    }

    if (!isProtocolSwapState(state)) throw new Error('State is not a protocol swap state');

    const signedAmount = approvedAmount;
    const amountToSwap = state.inputAmount;
    const amountToReceive = state.minimumReceived || '0';

    console.log('!! CollateralSwapActionsViaParaswapAdapters', {
      amountToSwap: amountToSwap,
      amountToReceive: amountToReceive,
      signedAmount,
    });

    console.log('Partner using app code', optimalRateData.partner);

    console.log({
      amountToSwap: amountToSwap,
      amountToReceive: amountToReceive,
      poolReserve: state.sourceReserve.reserve,
      targetReserve: state.destinationReserve.reserve,
      isWrongNetwork: state.isWrongNetwork,
      symbol: state.sourceToken.symbol,
      blocked: state.actionsBlocked,
      isMaxSelected: isMaxSelected,
      useFlashLoan: true,
      swapCallData: swapCallData,
      signature: signatureParams?.splitedSignature,
      deadline: signatureParams?.deadline,
      signedAmount,
    });

    let response;
    try {
      // 2. Prepare Tx
      const txs = await swapCollateral({
        amountToSwap: amountToSwap,
        amountToReceive: amountToReceive,
        poolReserve: state.sourceReserve.reserve,
        targetReserve: state.destinationReserve.reserve,
        isWrongNetwork: state.isWrongNetwork,
        symbol: state.sourceToken.symbol,
        blocked: state.actionsBlocked,
        isMaxSelected: isMaxSelected,
        useFlashLoan: true,
        swapCallData: swapCallData,
        augustus: augustus,
        signature: signatureParams?.splitedSignature,
        deadline: signatureParams?.deadline,
        signedAmount,
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
      console.log('populatedTx', populatedTx);
      const txWithGasEstimation = await estimateGasLimit(populatedTx, state.chainId);
      response = await sendTx(txWithGasEstimation);
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
      trackingHandlers.trackSwap(); // TODO: check this happening in all actions
      params.invalidateAppState(); // TODO: check this happening in all actions
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
      setTxError(parsedError);
      setMainTxState({
        loading: false,
      });
      setState({
        actionsLoading: false,
        error: {
          rawError: parsedError.rawError,
          message: `Error: ${parsedError.error} on ${parsedError.txAction}`,
          actionBlocked: parsedError.actionBlocked,
        },
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
