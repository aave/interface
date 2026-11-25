import { ComputedUserReserve, valueToBigNumber } from '@aave/math-utils';
import { Dispatch, useEffect } from 'react';
import { EmodeCategory } from 'src/helpers/types';
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
import { getCollateralSwapReceivedVia } from '../helpers/shared/provider.helpers';
import {
  ActionsBlockedReason,
  isProtocolSwapState,
  SwapParams,
  SwapProvider,
  SwapState,
  SwapType,
} from '../types';

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
  const { user: extendedUser, reserves, eModes } = useAppDataContext();
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
        eModes,
        requiresInvertedQuote,
      });
    }
  }, [
    params.swapType,
    state.sourceToken,
    state.destinationToken,
    state.inputAmount,
    state.outputAmount,
    state.sellAmountFormatted,
    state.buyAmountFormatted,
    extendedUser,
    reserves,
    eModes,
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
  eModes,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  extendedUser: ExtendedFormattedUser | undefined;
  reserves: ComputedReserveData[];
  eModes: Record<number, EmodeCategory>;
  requiresInvertedQuote: boolean;
}) => {
  const fromAssetUserReserve = extendedUser?.userReservesData.find(
    (ur) => ur.underlyingAsset.toLowerCase() === state.sourceToken?.underlyingAddress.toLowerCase()
  );
  const toAssetUserReserve = extendedUser?.userReservesData.find(
    (ur) =>
      ur.underlyingAsset.toLowerCase() === state.destinationToken?.underlyingAddress.toLowerCase()
  );

  if (
    !fromAssetUserReserve ||
    !toAssetUserReserve ||
    !extendedUser ||
    !state.swapRate ||
    !state.sellAmountFormatted ||
    !state.buyAmountFormatted
  )
    return;

  if (!isProtocolSwapState(state)) {
    return;
  }

  const hfParams = state.swapRate
    ? getHFAfterSwapParamsFromSwapType(
        state,
        fromAssetUserReserve,
        toAssetUserReserve,
        extendedUser,
        eModes
      )
    : undefined;

  // HF effect of withdrawing inputAmount on its own (copied from SwitchModalTxDetails).
  // It only depends on the sold side, so it can pick the flow before the HF after swap is known.
  const hfEffectOfFromAmount = (() => {
    try {
      return hfParams ? calculateHFAfterSwap(hfParams).hfEffectOfFromAmount.toString() : '0';
    } catch {
      return '0';
    }
  })();

  const forceFlashloanFlow =
    state.provider === SwapProvider.COW_PROTOCOL &&
    (state.swapType === SwapType.RepayWithCollateral || state.swapType === SwapType.DebtSwap);
  const useFlashloan =
    forceFlashloanFlow ||
    (extendedUser?.healthFactor !== '-1' &&
      valueToBigNumber(extendedUser?.healthFactor || 0)
        .minus(valueToBigNumber(hfEffectOfFromAmount || 0))
        .lt(LIQUIDATION_SAFETY_THRESHOLD));

  // HF after swap for the flow that will actually run: whether a newly bought collateral counts
  // depends on how it is received (supply vs aToken transfer).
  const hfAfterSwap = (() => {
    try {
      if (!hfParams) return undefined;
      return calculateHFAfterSwap({
        ...hfParams,
        toAssetReceivedVia: getCollateralSwapReceivedVia(useFlashloan),
      }).hfAfterSwap.toString();
    } catch {
      return undefined;
    }
  })();

  const isHFLow = () => {
    if (!hfAfterSwap) return false;

    const hfNumber = valueToBigNumber(hfAfterSwap);

    if (hfNumber.lt(0)) return false;

    return hfNumber.lt(LIQUIDATION_SAFETY_THRESHOLD) && hfNumber.gte(LIQUIDATION_DANGER_THRESHOLD);
  };

  const isLiquidatable =
    hfAfterSwap && hfAfterSwap !== '-1'
      ? valueToBigNumber(hfAfterSwap).lt(LIQUIDATION_DANGER_THRESHOLD)
      : false;

  if (!state.ratesLoading && !!state.provider) {
    setState({
      isHFLow: isHFLow(),
      isLiquidatable,
      hfAfterSwap: Number(hfAfterSwap || '0'),
      useFlashloan,
      isSwapFlowSelected: true,
      actionsBlocked: {
        [ActionsBlockedReason.IS_LIQUIDATABLE]: isLiquidatable ? true : undefined,
      },
    });
  }
};

const getHFAfterSwapParamsFromSwapType = (
  state: SwapState,
  fromAssetUserReserve: ComputedUserReserve,
  toAssetUserReserve: ComputedUserReserve,
  user: ExtendedFormattedUser,
  eModes: Record<number, EmodeCategory>
): CalculateHFAfterSwapProps | undefined => {
  if (!state.sellAmountFormatted || !state.buyAmountFormatted) return undefined;
  switch (state.swapType) {
    case SwapType.CollateralSwap:
      return {
        fromAmount: state.sellAmountFormatted.toString(),
        toAmountAfterSlippage: state.buyAmountFormatted.toString(),
        fromAssetData: state.sourceReserve.reserve,
        toAssetData: state.destinationReserve.reserve,
        toAssetUserData: toAssetUserReserve,
        fromAssetUserData: fromAssetUserReserve,
        fromAssetType: 'collateral',
        toAssetType: 'collateral',
        user,
        eModes,
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
        eModes,
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
        eModes,
      };
    case SwapType.WithdrawAndSwap:
      return {
        fromAmount: state.sellAmountFormatted.toString(),
        toAmountAfterSlippage: state.buyAmountFormatted.toString(),
        fromAssetData: state.sourceReserve.reserve,
        toAssetData: state.destinationReserve.reserve,
        fromAssetUserData: fromAssetUserReserve,
        fromAssetType: 'collateral',
        toAssetType: 'none',
        user,
        eModes,
      };
    default:
      return undefined;
  }
};
