import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { Dispatch, useEffect } from 'react';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateHFAfterSwap } from 'src/utils/hfUtils';

import {
  LIQUIDATION_DANGER_THRESHOLD,
  LIQUIDATION_SAFETY_THRESHOLD,
} from '../constants/shared.constants';
import { SwapParams, SwapState, SwapType } from '../types';

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

  useEffect(() => {
    if (params.swapType === SwapType.CollateralSwap) {
      return collateralSwapFlowSelector({ params, state, setState, extendedUser, reserves });
    } else {
      // For non-collateral swaps, set isSwapFlowSelected to true
      setState({ isSwapFlowSelected: true }); // TODO: remove wrapper if
    }
  }, [
    params.swapType,
    state.sourceToken,
    state.destinationToken,
    extendedUser,
    reserves,
    state.swapRate,
  ]);
};

export const collateralSwapFlowSelector = ({
  state,
  setState,
  extendedUser,
  reserves,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  extendedUser: ExtendedFormattedUser | undefined;
  reserves: ComputedReserveData[];
}) => {
  const poolReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === state.sourceToken?.addressToSwap.toLowerCase()
  );

  const targetReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === state.destinationToken?.addressToSwap.toLowerCase()
  );

  const userReserve = extendedUser?.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === state.sourceToken?.addressToSwap.toLowerCase()
  );

  // Compute HF effect of withdrawing inputAmount (copied from SwitchModalTxDetails)
  const calculateHfEffectOfFromAmount = () => {
    try {
      if (!poolReserve || !userReserve || !extendedUser || !state.swapRate || !targetReserve)
        return { hfEffectOfFromAmount: '0' };

      // Amounts in human units (mirror SwitchModalTxDetails: intent uses destSpot, market uses destAmount)
      const fromAmount = normalizeBN(
        state.swapRate.srcAmount,
        state.swapRate.srcDecimals
      ).toString();
      const toAmountRaw = normalizeBN(
        state.swapRate.provider === 'cowprotocol'
          ? state.swapRate.destSpot
          : state.swapRate.destAmount,
        state.swapRate.destDecimals
      ).toString();
      const toAmountAfterSlippage = valueToBigNumber(toAmountRaw)
        .multipliedBy(1 - state.safeSlippage)
        .toString();

      const { hfEffectOfFromAmount, hfAfterSwap } = calculateHFAfterSwap({
        fromAmount,
        fromAssetData: poolReserve,
        fromAssetUserData: userReserve,
        user: extendedUser,
        toAmountAfterSlippage: toAmountAfterSlippage,
        toAssetData: targetReserve,
      });

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

  const isLiquidatable = () => {
    if (!hfAfterSwap) return false;

    const hfNumber = valueToBigNumber(hfAfterSwap);

    if (hfNumber.lt(0)) return false;

    return hfNumber.lt(LIQUIDATION_DANGER_THRESHOLD);
  };

  const shouldUseFlashloanFn = (healthFactor: string, hfEffectOfFromAmount: string) => {
    return (
      healthFactor !== '-1' &&
      valueToBigNumber(healthFactor)
        .minus(valueToBigNumber(hfEffectOfFromAmount))
        .lt(LIQUIDATION_SAFETY_THRESHOLD)
    );
  };

  const shouldUseFlashloanValue = shouldUseFlashloanFn(
    poolReserve && userReserve && extendedUser ? extendedUser?.healthFactor ?? '-1' : '-1',
    poolReserve && userReserve && extendedUser ? hfEffectOfFromAmount ?? '0' : '0'
  );

  if (!state.ratesLoading && !!state.swapRate?.provider) {
    if (shouldUseFlashloanValue === state.useFlashloan) {
      return;
    }
    setState({ useFlashloan: shouldUseFlashloanValue });
    setState({ isSwapFlowSelected: true });
  }

  setState({ isHFLow: isHFLow(), isLiquidatable: isLiquidatable() });
};
