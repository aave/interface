import { valueToBigNumber } from '@aave/math-utils';
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
import { isProtocolSwapState, SwapParams, SwapState, SwapType } from '../types';

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
    if (params.swapType === SwapType.Swap) {
      // For non-collateral swaps, set isSwapFlowSelected to true
      setState({ isSwapFlowSelected: true });
    } else {
      return healthFactorSensibleSwapFlowSelector({
        params,
        state,
        setState,
        extendedUser,
        reserves,
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
}) => {
  const userReserve = extendedUser?.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === state.sourceToken?.underlyingAddress.toLowerCase()
  );

  if (!userReserve || !extendedUser || !state.swapRate) return;

  if (!isProtocolSwapState(state)) {
    return;
  }

  // Compute HF effect of withdrawing inputAmount (copied from SwitchModalTxDetails)
  const calculateHfEffectOfFromAmount = () => {
    try {
      if (!state.swapRate) return { hfEffectOfFromAmount: '0', hfAfterSwap: undefined };

      // Amounts in human units (mirror SwitchModalTxDetails: intent uses destSpot, market uses destAmount)
      const fromAmount = state.inputAmount;
      const toAmountAfterSlippage = state.minimumReceived;

      const { hfEffectOfFromAmount, hfAfterSwap } = calculateHFAfterSwap({
        fromAmount,
        fromAssetData: state.sourceReserve.reserve,
        fromAssetUserData: userReserve,
        user: extendedUser,
        toAmountAfterSlippage: valueToBigNumber(toAmountAfterSlippage || '0'),
        toAssetData: state.destinationReserve.reserve,
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

  const isLiquidatable = hfAfterSwap
    ? valueToBigNumber(hfAfterSwap).lt(LIQUIDATION_DANGER_THRESHOLD) && hfAfterSwap !== '-1'
    : false;

  const useFlashloan =
    extendedUser?.healthFactor !== '-1' &&
    valueToBigNumber(extendedUser?.healthFactor || 0)
      .minus(valueToBigNumber(hfEffectOfFromAmount || 0))
      .lt(LIQUIDATION_SAFETY_THRESHOLD);

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
