import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { Dispatch } from 'react';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { saveParaswapTxToUserHistory } from 'src/utils/swapAdapterHistory';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../../../TxActionsWrapper';
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

/**
 * Repay-with-collateral via ParaSwap Adapter.
 *
 * Flow summary:
 * 1) Approve aToken (or use permit) to the RepayWithCollateral adapter
 * 2) Build a ParaSwap route INVERTED relative to the UI: collateral aToken -> debt token
 *    - We invert because the protocol action consumes collateral to acquire the debt asset
 * 3) Compute repay amounts with slippage; detect `repayAllDebt` when balance covers max with margin
 * 4) Call adapter with swap calldata + optional permit to execute repay and residual handling
 */
export const RepayWithCollateralActionsViaParaswap = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const { setTxError, setMainTxState, approvalTxState } = useModalContext();
  const { sendTx } = useWeb3Context();
  const [paraswapRepayWithCollateral, currentMarketData, estimateGasLimit] = useRootStore(
    useShallow((state) => [
      state.paraswapRepayWithCollateral,
      state.currentMarketData,
      state.estimateGasLimit,
    ])
  );

  const toRepaySelectedAmountFormatted = state.inputAmount;
  const collateralToRepayWithAmountFormatted = state.outputAmount;
  const collateralToRepayAmountToApprove = normalize(
    calculateSignedAmount(
      normalizeBN(
        collateralToRepayWithAmountFormatted,
        -state.destinationToken.decimals
      ).toString(),
      0
      // Adds margin to account future incremental so better ux
    ),
    state.destinationToken.decimals
  );

  // Approval is aToken ERC20 Approval
  const {
    requiresApproval,
    signatureParams,
    approval,
    tryPermit,
    approvedAmount,
    loadingPermitData,
  } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.destinationToken.addressToSwap, // aToken
    symbol: state.destinationToken.symbol,
    decimals: state.destinationToken.decimals,
    amount: collateralToRepayAmountToApprove.toString(),
    spender: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
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
    if (!state.swapRate || !isParaswapRates(state.swapRate))
      throw new Error('Route required to build transaction');

    setMainTxState({
      txHash: undefined,
      loading: true,
    });

    try {
      const tokenToRepayWithBalance = state.destinationToken.balance || '0';
      let safeAmountToRepayAll = valueToBigNumber(state.sourceReserve.variableBorrows || '0');
      // Add in the approximate interest accrued over the next 30 minutes
      safeAmountToRepayAll = safeAmountToRepayAll.plus(
        safeAmountToRepayAll
          .multipliedBy(state.sourceReserve.reserve.variableBorrowAPY)
          .dividedBy(360 * 24 * 2)
      );

      let repayAmount, repayWithAmount;
      if (state.side === 'sell') {
        // If sell order i want to repay exactly the input amount
        repayAmount = state.isMaxSelected
          ? safeAmountToRepayAll.toFixed(state.sourceToken.decimals)
          : toRepaySelectedAmountFormatted;

        // Account slippage to make sure we have enough collateral to repay with
        repayWithAmount = valueToBigNumber(state.outputAmount || '0')
          .multipliedBy(1 + Number(state.slippage) / 100)
          .toFixed(state.destinationToken.decimals);
      } else {
        // If buy order i want use exactly the collateral to repay with amount
        repayWithAmount = state.outputAmount;

        // Account slippage to make sure we pay as much debt as possible
        repayAmount = valueToBigNumber(state.inputAmount || '0')
          .dividedBy(1 + Number(state.slippage) / 100)
          .toFixed(state.sourceToken.decimals);
      }

      // The slippage is factored into the collateral amount because when we swap for 'exactOut', positive slippage is applied on the collateral amount.
      const collateralAmountRequiredToCoverDebt = safeAmountToRepayAll
        .multipliedBy(state.sourceReserve.reserve.priceInUSD)
        .multipliedBy(100 + Number(state.slippage))
        .dividedBy(100)
        .dividedBy(state.destinationReserve.reserve.priceInUSD);

      const repayAllDebt =
        state.isMaxSelected &&
        valueToBigNumber(tokenToRepayWithBalance).gte(collateralAmountRequiredToCoverDebt);

      const invertedSide = state.side === 'sell' ? 'buy' : 'sell';

      // Prepare Swap (inversed, from the collateral asset to the debt to repay asset)
      const { swapCallData, augustus } = await getTransactionParams(
        invertedSide,
        state.chainId,
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.user,
        state.swapRate.optimalRateData,
        Number(state.slippage)
      );

      const txs = await paraswapRepayWithCollateral({
        repayAllDebt,
        repayAmount,
        rateMode: params.interestMode,
        repayWithAmount,

        fromAssetData: state.destinationReserve.reserve,
        poolReserve: state.sourceReserve.reserve,

        symbol: state.sourceReserve.reserve.symbol,
        isWrongNetwork: state.isWrongNetwork,
        useFlashLoan: state.useFlashloan || false,
        blocked: areActionsBlocked(state),
        swapCallData,
        augustus,
        signature: signatureParams?.splitedSignature,
        deadline: signatureParams?.deadline,
        signedAmount: approvedAmount,
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

      const txWithGasEstimation = await estimateGasLimit(populatedTx, state.chainId);
      const response = await sendTx(txWithGasEstimation);
      await response.wait(1);
      try {
        saveParaswapTxToUserHistory({
          protocol: 'paraswap',
          txHash: response.hash,
          swapType: state.swapType,
          chainId: state.chainId,
          status: OrderStatus.FULFILLED,
          account: state.user,
          timestamp: new Date().toISOString(),
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

      trackingHandlers.trackSwap();
      params.invalidateAppState();
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
        loading: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      sx={{
        mt: 6,
      }}
      preparingTransactions={state.actionsLoading}
      mainTxState={state.mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={state.processedSide === 'sell' ? state.sellAmountFormatted : state.buyAmountFormatted}
      requiresApproval={requiresApproval}
      isWrongNetwork={state.isWrongNetwork}
      blocked={areActionsBlocked(state)}
      handleAction={action}
      handleApproval={approval}
      actionText={<Trans>Repay {state.sourceReserve.reserve.symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {state.sourceReserve.reserve.symbol}</Trans>}
      fetchingData={state.ratesLoading || loadingPermitData}
      errorParams={{
        loading: false,
        disabled: areActionsBlocked(state),
        content: <Trans>Repay {state.sourceReserve.reserve.symbol}</Trans>,
        handleClick: action,
      }}
      tryPermit={tryPermit}
    />
  );
};
