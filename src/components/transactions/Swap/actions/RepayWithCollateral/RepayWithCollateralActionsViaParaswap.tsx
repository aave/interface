import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Dispatch } from 'react';
import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../../../TxActionsWrapper';
import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { getTransactionParams } from '../../helpers/paraswap';
import { isParaswapRates, ProtocolSwapParams, ProtocolSwapState, SwapState } from '../../types';

export const RepayWithCollateralActionsViaParaswap = ({
  params,
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [paraswapRepayWithCollateral, currentMarketData] = useRootStore(
    useShallow((state) => [state.paraswapRepayWithCollateral, state.currentMarketData])
  );

  const tokenToRepayWithBalance = state.destinationToken.balance || '0';

  let safeAmountToRepayAll = valueToBigNumber(state.sourceReserve.variableBorrows || '0');
  // Add in the approximate interest accrued over the next 30 minutes
  safeAmountToRepayAll = safeAmountToRepayAll.plus(
    safeAmountToRepayAll
      .multipliedBy(state.sourceReserve.reserve.variableBorrowAPY)
      .dividedBy(360 * 24 * 2)
  );

  const isMaxSelected = state.inputAmount === '-1';
  const repayAmount = isMaxSelected ? safeAmountToRepayAll.toString() : state.inputAmount;
  //   const repayAmountUsdValue = valueToBigNumber(repayAmount)
  //     .multipliedBy(state.sourceReserve.reserve.priceInUSD)
  //     .toString();

  // The slippage is factored into the collateral amount because when we swap for 'exactOut', positive slippage is applied on the collateral amount.
  const collateralAmountRequiredToCoverDebt = safeAmountToRepayAll
    .multipliedBy(state.sourceReserve.reserve.priceInUSD)
    .multipliedBy(100 + Number(state.slippage))
    .dividedBy(100)
    .dividedBy(state.destinationReserve.reserve.priceInUSD);

  const repayAllDebt =
    state.isMaxSelected &&
    valueToBigNumber(tokenToRepayWithBalance).gte(collateralAmountRequiredToCoverDebt);

  const { approval, action, loadingTxns, approvalTxState, mainTxState, requiresApproval } =
    useParaSwapTransactionHandler({
      protocolAction: ProtocolAction.repayCollateral,
      handleGetTxns: async (signature, deadline) => {
        if (!state.swapRate || !isParaswapRates(state.swapRate)) {
          throw new Error('No swap rate found'); // TODO: handle gracefully, this should not happen
        }

        const { swapCallData, augustus } = await getTransactionParams(
          state.side,
          state.chainId,
          state.sourceToken.addressToSwap,
          state.sourceToken.decimals,
          state.destinationToken.addressToSwap,
          state.destinationToken.decimals,
          state.user,
          state.swapRate.optimalRateData,
          Number(state.slippage)
        );

        // TODO: Fix this not working the tx builder via paraswap

        return paraswapRepayWithCollateral({
          repayAllDebt,
          repayAmount,
          rateMode: params.interestMode,
          repayWithAmount: state.outputAmount, // TODO: account slippage
          fromAssetData: state.destinationReserve.reserve,
          poolReserve: state.sourceReserve.reserve,
          isWrongNetwork: state.isWrongNetwork,
          symbol: state.destinationReserve.reserve.symbol,
          useFlashLoan: state.useFlashloan || false,
          blocked: state.actionsBlocked,
          swapCallData,
          augustus,
          signature,
          deadline,
          signedAmount: calculateSignedAmount(
            state.outputAmount,
            state.destinationReserve.reserve.decimals
          ),
        });
      },
      handleGetApprovalTxns: async () => {
        return paraswapRepayWithCollateral({
          repayAllDebt,
          repayAmount,
          rateMode: params.interestMode,
          repayWithAmount: state.outputAmount,
          fromAssetData: state.destinationReserve.reserve,
          poolReserve: state.sourceReserve.reserve,
          isWrongNetwork: state.isWrongNetwork,
          symbol: state.destinationReserve.reserve.symbol,
          useFlashLoan: false,
          blocked: state.actionsBlocked,
          swapCallData: '0x',
          augustus: API_ETH_MOCK_ADDRESS,
        });
      },
      gasLimitRecommendation: gasLimitRecommendations[ProtocolAction.repayCollateral].limit,
      skip:
        state.ratesLoading || !repayAmount || parseFloat(repayAmount) === 0 || state.actionsBlocked,
      spender: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER ?? '',
      deps: [state.destinationReserve.reserve.symbol, state.outputAmount],
    });

  if (!state.swapRate || !isParaswapRates(state.swapRate)) {
    console.error('No swap rate found');
    return;
  }

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={repayAmount}
      requiresApproval={requiresApproval}
      isWrongNetwork={state.isWrongNetwork}
      blocked={state.actionsBlocked}
      //   sx={state.sx}
      //   {...props}
      handleAction={action}
      handleApproval={() =>
        approval({
          amount: calculateSignedAmount(
            state.outputAmount,
            state.destinationReserve.reserve.decimals
          ),
          underlyingAsset: state.destinationReserve.reserve.aTokenAddress,
        })
      }
      actionText={<Trans>Repay {state.sourceReserve.reserve.symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {state.sourceReserve.reserve.symbol}</Trans>}
      fetchingData={state.ratesLoading}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked,
        content: <Trans>Repay {state.sourceReserve.reserve.symbol}</Trans>,
        handleClick: action,
      }}
      tryPermit
    />
  );
};
