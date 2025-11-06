import { normalize } from '@aave/math-utils';
import { OrderStatus } from '@cowprotocol/cow-sdk';
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
  const amountToApprove = useMemo(() => {
    if (!state.sellAmountFormatted || !state.sellAmountToken) return '0';
    return calculateSignedAmount(state.sellAmountFormatted, state.sellAmountToken.decimals);
  }, [state.sellAmountFormatted, state.sellAmountToken]);

  const {
    requiresApproval,
    signatureParams,
    approval,
    tryPermit,
    approvedAmount,
    loadingPermitData,
  } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.sourceToken.addressToSwap, // aToken
    symbol: state.sourceToken.symbol,
    amount: normalize(amountToApprove.toString(), state.sourceToken?.decimals ?? 18),
    decimals: state.sourceToken.decimals,
    spender: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
    setState,
    trackingHandlers,
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

      const result = await swapper.getTransactionParams(
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.user,
        optimalRateData,
        Number(state.slippage)
      );
      swapCallData = result.swapCallData;
      augustus = result.augustus;
    } else {
      const swapper = ExactOutSwapper(state.chainId);

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
    const amountToReceive = state.buyAmountFormatted || '0';

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
      const txWithGasEstimation = await estimateGasLimit(populatedTx, state.chainId);
      response = await sendTx(txWithGasEstimation);
      await response.wait(1);
      try {
        const { saveParaswapTxToUserHistory: addParaswapTx } = await import(
          'src/utils/swapAdapterHistory'
        );
        addParaswapTx({
          protocol: 'paraswap',
          txHash: response.hash,
          swapType: params.swapType,
          chainId: state.chainId,
          account: state.user,
          timestamp: new Date().toISOString(),
          status: OrderStatus.FULFILLED,
          srcToken: {
            address: state.sourceToken.addressToSwap,
            symbol: state.sourceToken.symbol,
            name: state.sourceToken.symbol,
            decimals: state.sourceToken.decimals,
          },
          destToken: {
            address: state.destinationToken.addressToSwap,
            symbol: state.destinationToken.symbol,
            name: state.destinationToken.symbol,
            decimals: state.destinationToken.decimals,
          },
          srcAmount: state.sellAmountBigInt?.toString() ?? '0',
          destAmount: state.buyAmountBigInt?.toString() ?? '0',
        });
      } catch {}
      addTransaction(
        response.hash,
        {
          txState: 'success',
        },
        {
          chainId: state.chainId,
        }
      );
      trackingHandlers.trackSwap();
      params.invalidateAppState();
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);

      // Check if this is a gas estimation error (from estimateGasLimit call)
      // Gas estimation errors typically occur when estimateGasLimit fails
      const errorMessage = parsedError.rawError?.message?.toLowerCase() || '';
      const isGasEstimationError =
        errorMessage.includes('gas') ||
        errorMessage.includes('estimation') ||
        (errorMessage.includes('execution reverted') && errorMessage.includes('estimation'));

      // For gas estimation errors in Paraswap actions, show as warning instead of blocking error
      if (isGasEstimationError) {
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
      } else {
        // For other errors, handle normally
        setTxError(parsedError);
        setState({
          actionsLoading: false,
          error: {
            rawError: parsedError.rawError,
            message: `Error: ${parsedError.error} on ${parsedError.txAction}`,
            actionBlocked: parsedError.actionBlocked,
          },
        });
      }

      setMainTxState({
        loading: false,
      });

      const reason = error instanceof Error ? error.message : 'Swap failed';
      trackingHandlers.trackSwapFailed(reason);
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
      fetchingData={state.actionsLoading || loadingPermitData}
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
