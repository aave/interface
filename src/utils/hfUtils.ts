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

interface CalculateHFAfterSwapProps {
  fromAmount: BigNumberValue;
  fromAssetData: ComputedReserveData;
  fromAssetUserData: ComputedUserReserve;
  toAmountAfterSlippage: BigNumberValue;
  toAssetData: ComputedReserveData;
  user: ExtendedFormattedUser;
}

interface CalculateHFAfterSwapRepayProps {
  fromAmountAfterSlippage: BigNumberValue;
  fromAssetData: ComputedReserveData;
  userReserve: ComputedUserReserve;
  amountToRepay: BigNumberValue;
  toAssetData: ComputedReserveData;
  user: ExtendedFormattedUser;
}

export function calculateHFAfterSwap({
  fromAmount,
  fromAssetData,
  fromAssetUserData,
  toAmountAfterSlippage,
  toAssetData,
  user,
}: CalculateHFAfterSwapProps) {
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold;

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  // it takes into account if in emode as threshold is different
  let hfEffectOfFromAmount = '0';

  if (fromAssetUserData.usageAsCollateralEnabledOnUser && fromAssetData.usageAsCollateralEnabled) {
    hfEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(fromAmount).multipliedBy(
        fromAssetData.formattedPriceInMarketReferenceCurrency
      ),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString();
  }

  // HF after swap (same as supply calcs as it needs to calculate as if we where supplying new reserve)
  let hfEffectOfToAmount = '0';
  if (
    (!user.isInIsolationMode && !toAssetData.isIsolated) ||
    (user.isInIsolationMode &&
      user.isolatedReserve?.underlyingAsset === toAssetData.underlyingAsset)
  ) {
    hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(
        toAmountAfterSlippage
      ).multipliedBy(toAssetData.formattedPriceInMarketReferenceCurrency),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: toAssetData.formattedReserveLiquidationThreshold,
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

export const calculateHFAfterRepay = ({
  user,
  fromAmountAfterSlippage,
  fromAssetData,
  amountToRepay,
  toAssetData,
  userReserve,
}: CalculateHFAfterSwapRepayProps) => {
  // it takes into account if in emode as threshold is different
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold;

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  let hfEffectOfFromAmount = '0';

  if (userReserve.usageAsCollateralEnabledOnUser && fromAssetData.usageAsCollateralEnabled) {
    hfEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(
        fromAmountAfterSlippage
      ).multipliedBy(fromAssetData.formattedPriceInMarketReferenceCurrency),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString();
  }

  // const hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
  //   collateralBalanceMarketReferenceCurrency:
  //     //  usageAsCollateralEnabledOnUser
  //     //   ? valueToBigNumber(user?.totalCollateralUSD || '0').minus(
  //     //       valueToBigNumber(reserve.priceInUSD).multipliedBy(amount)
  //     //     )
  //     user.totalCollateralMarketReferenceCurrency,
  //   borrowBalanceMarketReferenceCurrency: valueToBigNumber(
  //     user.totalBorrowsMarketReferenceCurrency
  //   ).minus(
  //     valueToBigNumber(toAssetData.formattedPriceInMarketReferenceCurrency).multipliedBy(
  //       amountToRepay
  //     )
  //   ),
  //   currentLiquidationThreshold: reserveLiquidationThreshold,
  // }).toString();

  const hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency:
      // repayWithATokens && usageAsCollateralEnabledOnUser
      //   ? valueToBigNumber(user?.totalCollateralUSD || '0').minus(
      //       valueToBigNumber(reserve.priceInUSD).multipliedBy(amount)
      //     )
      //   :
      user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(
      user.totalBorrowsMarketReferenceCurrency
    ).minus(
      valueToBigNumber(toAssetData.priceInMarketReferenceCurrency).multipliedBy(amountToRepay)
    ),
    currentLiquidationThreshold: toAssetData.formattedReserveLiquidationThreshold,
  }).toString(10);

  return {
    hfEffectOfFromAmount: valueToBigNumber(hfEffectOfFromAmount),
    // valueToBigNumber(hfEffectOfToAmount),
    hfAfterSwap: valueToBigNumber(user.healthFactor)
      .plus(hfEffectOfToAmount)
      .minus(hfEffectOfFromAmount),
  };
};
