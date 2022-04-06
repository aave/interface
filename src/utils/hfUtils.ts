import {
  ComputedUserReserve,
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
  BigNumberValue,
} from '@aave/math-utils';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import BigNumber from 'bignumber.js';

interface CalculateHFAfterSwapProps {
  fromAmount: BigNumberValue;
  fromAssetData: ComputedReserveData;
  fromAssetUserData: ComputedUserReserve;
  toAmountAfterSlippage: BigNumberValue;
  toAssetData: ComputedReserveData;
  toAssetUserData?: ComputedUserReserve;
  user: ExtendedFormattedUser;
}

export function calculateHFAfterSwap({
  fromAmount,
  fromAssetData,
  fromAssetUserData,
  toAmountAfterSlippage,
  toAssetData,
  // toAssetUserData,
  user,
}: CalculateHFAfterSwapProps) {
  // calculate hf params taking into account removing swap amount (as if it where a withdraw)
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold;

  let totalCollateralInETHAfterWithdraw = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  );
  let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold;

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  // it takes into account if in emode as threshold is different
  let hfEffectOfFromAmount = user.healthFactor;

  if (
    fromAssetUserData &&
    fromAssetUserData.usageAsCollateralEnabledOnUser &&
    toAssetData.usageAsCollateralEnabled
  ) {
    const amountToWithdrawInEth = valueToBigNumber(fromAmount).multipliedBy(
      toAssetData.formattedPriceInMarketReferenceCurrency
    );
    totalCollateralInETHAfterWithdraw =
      totalCollateralInETHAfterWithdraw.minus(amountToWithdrawInEth);

    liquidationThresholdAfterWithdraw = valueToBigNumber(
      user.totalCollateralMarketReferenceCurrency
    )
      .multipliedBy(valueToBigNumber(user.currentLiquidationThreshold))
      .minus(valueToBigNumber(amountToWithdrawInEth).multipliedBy(reserveLiquidationThreshold))
      .div(totalCollateralInETHAfterWithdraw)
      .toFixed(4, BigNumber.ROUND_DOWN);

    hfEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: totalCollateralInETHAfterWithdraw,
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
    }).toString();
  }

  // HF after swap (same as supply calcs as it needs to alculate as if we where supplying new reserve)
  const amountIntEth = new BigNumber(toAmountAfterSlippage).multipliedBy(
    toAssetData.formattedPriceInMarketReferenceCurrency
  );

  const totalCollateralMarketReferenceCurrencyAfter = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  ).plus(amountIntEth);

  const liquidationThresholdAfter = valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
    .multipliedBy(user.currentLiquidationThreshold)
    .plus(amountIntEth.multipliedBy(toAssetData.formattedReserveLiquidationThreshold))
    .dividedBy(totalCollateralMarketReferenceCurrencyAfter);

  // how the hf will be with the swapped to amount. It takes into account isolation mode
  let hfEffectOfToAmount = user.healthFactor;

  if (
    (!user.isInIsolationMode && !toAssetData.isIsolated) ||
    (user.isInIsolationMode &&
      user.isolatedReserve?.underlyingAsset === toAssetData.underlyingAsset)
  ) {
    hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyAfter,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(
        user.totalBorrowsMarketReferenceCurrency
      ),
      currentLiquidationThreshold: liquidationThresholdAfter,
    }).toString();
  }

  return {
    hfEffectOfFromAmount,
    hfAfterSwap:
      user.healthFactor === '-1'
        ? valueToBigNumber('-1')
        : valueToBigNumber(user.healthFactor).plus(hfEffectOfToAmount).minus(hfEffectOfFromAmount),
  };
}
