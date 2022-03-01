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
  fromAmount: BigNumberValue | undefined;
  fromAssetData: ComputedReserveData | undefined;
  fromAssetUserData: ComputedUserReserve | undefined;
  toAmountAfterSlippage: BigNumberValue | undefined;
  toAssetData: ComputedReserveData | undefined;
  toAssetUserData: ComputedUserReserve | undefined;
  user: ExtendedFormattedUser;
}

export function calculateHFAfterSwap({
  fromAmount,
  fromAssetData,
  fromAssetUserData,
  toAmountAfterSlippage,
  toAssetData,
  toAssetUserData,
  user,
}: CalculateHFAfterSwapProps) {
  const hfEffectOfFromAmount =
    fromAmount &&
    fromAssetData &&
    fromAssetData.usageAsCollateralEnabled &&
    fromAssetUserData?.usageAsCollateralEnabledOnUser
      ? calculateHealthFactorFromBalancesBigUnits({
          collateralBalanceMarketReferenceCurrency: valueToBigNumber(fromAmount).multipliedBy(
            fromAssetData.formattedPriceInMarketReferenceCurrency
          ),
          borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
          currentLiquidationThreshold: fromAssetData.formattedReserveLiquidationThreshold,
        }).toString()
      : '0';
  const hfEffectOfToAmount =
    toAmountAfterSlippage &&
    toAssetData &&
    toAssetData.usageAsCollateralEnabled &&
    (toAssetUserData && toAssetUserData.underlyingBalance !== '0'
      ? toAssetUserData.usageAsCollateralEnabledOnUser
      : true)
      ? calculateHealthFactorFromBalancesBigUnits({
          collateralBalanceMarketReferenceCurrency: valueToBigNumber(
            toAmountAfterSlippage
          ).multipliedBy(toAssetData.formattedPriceInMarketReferenceCurrency),
          borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
          currentLiquidationThreshold: toAssetData.formattedReserveLiquidationThreshold,
        }).toString()
      : '0';

  return {
    hfEffectOfFromAmount,
    hfAfterSwap:
      user.healthFactor === '-1'
        ? valueToBigNumber('-1')
        : valueToBigNumber(user.healthFactor).minus(hfEffectOfFromAmount).plus(hfEffectOfToAmount),
  };
}
