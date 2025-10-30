import { ComputedUserReserve, valueToBigNumber } from '@aave/math-utils';
import { Dispatch, useEffect } from 'react';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateHFAfterSwap, CalculateHFAfterSwapProps } from 'src/utils/hfUtils';

import {
  LIQUIDATION_DANGER_THRESHOLD,
  LIQUIDATION_SAFETY_THRESHOLD,
} from '../constants/shared.constants';
import { isProtocolSwapState, SwapParams, SwapProvider, SwapState, SwapType } from '../types';

/**
 * React hook that decides the execution flow (simple vs flashloan) and
 * computes health-factor effects for protocol-aware swaps.
 *
 * Writes derived flags into SwapState: isHFLow, isLiquidatable, useFlashloan,
 * and marks the flow as selected once enough context is present.
 */
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
  const requiresInvertedQuote = state.isInvertedSwap;

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

/**
 * Pure helper that computes HF and determines whether to force flashloan.
 */
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
    state.provider === SwapProvider.COW_PROTOCOL &&
    (state.swapType === SwapType.RepayWithCollateral || state.swapType === SwapType.DebtSwap);
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
  if (!state.sellAmountFormatted || !state.buyAmountFormatted) return undefined;
  switch (state.swapType) {
    case SwapType.CollateralSwap:
      return {
        fromAmount: state.sellAmountFormatted.toString(),
        toAmountAfterSlippage: state.buyAmountFormatted.toString(),
        fromAssetData: state.sourceReserve.reserve,
        toAssetData: state.destinationReserve.reserve,
        fromAssetUserData: fromAssetUserReserve,
        fromAssetType: 'collateral',
        toAssetType: 'collateral',
        user,
      };
    case SwapType.DebtSwap:
      return {
        fromAmount: state.sellAmountFormatted.toString(),
        toAmountAfterSlippage: state.buyAmountFormatted.toString(),
        fromAssetData: state.destinationReserve.reserve,
        toAssetData: state.sourceReserve.reserve,
        fromAssetUserData: toAssetUserReserve,
        user,
        fromAssetType: 'debt',
        toAssetType: 'debt',
      };

    case SwapType.RepayWithCollateral:
      return {
        fromAmount: state.sellAmountFormatted.toString(),
        toAmountAfterSlippage: state.buyAmountFormatted.toString(),
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
