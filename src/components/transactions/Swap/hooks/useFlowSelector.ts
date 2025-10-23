import { ComputedUserReserve, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { Dispatch, useEffect, useMemo } from 'react';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateHFAfterSwap, CalculateHFAfterSwapProps } from 'src/utils/hfUtils';

import { getCollateralSwapOrderCore } from '../actions/CollateralSwap/CollateralSwapActionsViaCoWAdapters';
import { getDebtSwapOrderCore } from '../actions/DebtSwap/DebtSwapActionsViaCoW';
import { getRepayWithCollateralOrderCore } from '../actions/RepayWithCollateral/RepayWithCollateralActionsViaCoW';
import {
  LIQUIDATION_DANGER_THRESHOLD,
  LIQUIDATION_SAFETY_THRESHOLD,
} from '../constants/shared.constants';
import { isProtocolSwapState, SwapParams, SwapState, SwapType } from '../types';
import { swapTypesThatRequiresInvertedQuote } from './useSwapQuote';

export const useFlowSelector = ({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const { user: extendedUser, reserves } = useAppDataContext();

  // TODO: Move to state and centralize this logic
  const requiresInvertedQuote = useMemo(
    () => swapTypesThatRequiresInvertedQuote.includes(state.swapType),
    [state.swapType]
  );

  useEffect(() => {
    if (params.swapType === SwapType.Swap) {
      // For non positions swaps, set isSwapFlowSelected to true
      setState({ isSwapFlowSelected: true });
    } else {
      return healthFactorSensibleSwapFlowSelector({
        params,
        state,
        setState,
        extendedUser,
        reserves,
        requiresInvertedQuote,
      });
    }
  }, [
    params.swapType,
    state.sourceToken,
    state.destinationToken,
    state.inputAmount,
    state.outputAmount,
    extendedUser,
    reserves,
    state.swapRate,
  ]);
};

export const healthFactorSensibleSwapFlowSelector = ({
  state,
  setState,
  extendedUser,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  extendedUser: ExtendedFormattedUser | undefined;
  reserves: ComputedReserveData[];
  requiresInvertedQuote: boolean;
}) => {
  const fromAssetUserReserve = extendedUser?.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === state.sourceToken?.underlyingAddress.toLowerCase()
  );
  const toAssetUserReserve = extendedUser?.userReservesData.find(
    (ur) =>
      ur.underlyingAsset.toLowerCase() === state.destinationToken?.underlyingAddress.toLowerCase()
  );

  if (!fromAssetUserReserve || !toAssetUserReserve || !extendedUser || !state.swapRate) return;

  if (!isProtocolSwapState(state)) {
    return;
  }

  // Compute HF effect of withdrawing inputAmount (copied from SwitchModalTxDetails)
  const calculateHfEffectOfFromAmount = () => {
    try {
      if (!state.swapRate) return { hfEffectOfFromAmount: '0', hfAfterSwap: undefined };

      const params = getHFAfterSwapParamsFromSwapType(
        state,
        fromAssetUserReserve,
        toAssetUserReserve,
        extendedUser
      );

      if (!params) return { hfEffectOfFromAmount: '0', hfAfterSwap: undefined };

      const { hfEffectOfFromAmount, hfAfterSwap } = calculateHFAfterSwap(params);

      return {
        hfEffectOfFromAmount: hfEffectOfFromAmount.toString(),
        hfAfterSwap: hfAfterSwap.toString(),
      };
    } catch {
      return { hfEffectOfFromAmount: '0', hfAfterSwap: undefined };
    }
  };

  const { hfEffectOfFromAmount, hfAfterSwap } = calculateHfEffectOfFromAmount();

  const isHFLow = () => {
    if (!hfAfterSwap) return false;

    const hfNumber = valueToBigNumber(hfAfterSwap);

    if (hfNumber.lt(0)) return false;

    return hfNumber.lt(LIQUIDATION_SAFETY_THRESHOLD) && hfNumber.gte(LIQUIDATION_DANGER_THRESHOLD);
  };

  const isLiquidatable = hfAfterSwap
    ? valueToBigNumber(hfAfterSwap).lt(LIQUIDATION_DANGER_THRESHOLD) && hfAfterSwap !== '-1'
    : false;

  const forceFlashloanFlow =
    state.swapType === SwapType.RepayWithCollateral || state.swapType === SwapType.DebtSwap;
  const useFlashloan =
    forceFlashloanFlow ||
    (extendedUser?.healthFactor !== '-1' &&
      valueToBigNumber(extendedUser?.healthFactor || 0)
        .minus(valueToBigNumber(hfEffectOfFromAmount || 0))
        .lt(LIQUIDATION_SAFETY_THRESHOLD));

  if (!state.ratesLoading && !!state.provider) {
    setState({
      isHFLow: isHFLow(),
      isLiquidatable,
      hfAfterSwap: Number(hfAfterSwap || '0'),
      useFlashloan,
      isSwapFlowSelected: true,
      actionsBlocked: state.actionsBlocked || isLiquidatable,
    });
  }
};

const getHFAfterSwapParamsFromSwapType = (
  state: SwapState,
  fromAssetUserReserve: ComputedUserReserve,
  toAssetUserReserve: ComputedUserReserve,
  user: ExtendedFormattedUser
): CalculateHFAfterSwapProps | undefined => {
  switch (state.swapType) {
    case SwapType.CollateralSwap:
      const collateralSwapOrderCore = getCollateralSwapOrderCore(state);

      return {
        fromAmount: normalizeBN(
          collateralSwapOrderCore.sellAmount.toString(),
          collateralSwapOrderCore.sellToken.decimals
        ).toString(),
        toAmountAfterSlippage: normalizeBN(
          collateralSwapOrderCore.buyAmount.toString(),
          collateralSwapOrderCore.buyToken.decimals
        ).toString(),
        fromAssetData: state.sourceReserve.reserve,
        toAssetData: state.destinationReserve.reserve,
        fromAssetUserData: fromAssetUserReserve,
        fromAssetType: 'collateral',
        toAssetType: 'collateral',
        user,
      };
    case SwapType.DebtSwap:
      const debtSwapOrderCore = getDebtSwapOrderCore(state);

      return {
        fromAmount: normalizeBN(
          debtSwapOrderCore.sellAmount.toString(),
          debtSwapOrderCore.sellToken.decimals
        ).toString(),
        toAmountAfterSlippage: normalizeBN(
          debtSwapOrderCore.buyAmount.toString(),
          debtSwapOrderCore.buyToken.decimals
        ).toString(),

        fromAssetData: state.destinationReserve.reserve,
        toAssetData: state.sourceReserve.reserve,
        fromAssetUserData: toAssetUserReserve,
        user,
        fromAssetType: 'debt',
        toAssetType: 'debt',
      };

    case SwapType.RepayWithCollateral:
      const repayWithCollateralOrderCore = getRepayWithCollateralOrderCore(state);

      return {
        fromAmount: normalizeBN(
          repayWithCollateralOrderCore.sellAmount.toString(),
          repayWithCollateralOrderCore.sellToken.decimals
        ).toString(),
        toAmountAfterSlippage: normalizeBN(
          repayWithCollateralOrderCore.buyAmount.toString(),
          repayWithCollateralOrderCore.buyToken.decimals
        ).toString(),
        fromAssetData: state.destinationReserve.reserve,
        toAssetData: state.sourceReserve.reserve,
        fromAssetUserData: toAssetUserReserve,
        user,
        fromAssetType: 'collateral',
        toAssetType: 'debt',
      };
    default:
      return undefined;
  }
};
