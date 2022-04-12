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
  user: ExtendedFormattedUser;
}

interface CalculateHFAfterSwapRepayProps {
  fromAmountAfterSlippage: BigNumberValue;
  fromAssetData: ComputedReserveData;
  userReserve: ComputedUserReserve;
  amountToRepay: BigNumberValue;
  toAssetData: ComputedReserveData;
  user: ExtendedFormattedUser;
  debt: string;
}

interface CalculateHFAfterSwapRepayProps2 {
  fromAmountAfterSlippage: BigNumberValue;
  fromAssetData: ComputedReserveData;
  userReserve: ComputedUserReserve;
  amountToRepay: BigNumberValue;
  toAssetData: ComputedReserveData;
  user: ExtendedFormattedUser;
  repayWithUserReserve: ComputedUserReserve;
  debt: string;
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
  debt,
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

  const hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(debt).minus(
      BigNumber.min(fromAmountAfterSlippage, debt)
    ),
    currentLiquidationThreshold: toAssetData.formattedReserveLiquidationThreshold,
  });

  console.log(`
    hf org : ${user.healthFactor}
    hf pre : ${hfEffectOfFromAmount}
    hf to  : ${hfEffectOfToAmount}
    hf af  : ${
      hfEffectOfToAmount.eq(-1)
        ? hfEffectOfToAmount
        : valueToBigNumber(user.healthFactor).plus(hfEffectOfToAmount).minus(hfEffectOfFromAmount)
    }
  `);

  return {
    hfEffectOfFromAmount: valueToBigNumber(hfEffectOfFromAmount),
    hfAfterSwap: hfEffectOfToAmount.eq(-1)
      ? hfEffectOfToAmount
      : valueToBigNumber(user.healthFactor).plus(hfEffectOfToAmount).minus(hfEffectOfFromAmount),
  };
};

export const calculateHFAfterRepay2 = ({
  user,
  fromAmountAfterSlippage,
  fromAssetData,
  amountToRepay,
  toAssetData,
  userReserve,
  repayWithUserReserve,
  debt,
}: CalculateHFAfterSwapRepayProps2) => {
  // it takes into account if in emode as threshold is different
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === fromAssetData.eModeCategoryId
      ? fromAssetData.formattedEModeLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold;

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  let hfInitialEffectOfFromAmount = '0';

  if (userReserve.usageAsCollateralEnabledOnUser && fromAssetData.usageAsCollateralEnabled) {
    hfInitialEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(
        fromAmountAfterSlippage
      ).multipliedBy(fromAssetData.formattedPriceInMarketReferenceCurrency),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString();
  }

  const fromAmountInMarketReferenceCurrency = valueToBigNumber(
    BigNumber.min(fromAmountAfterSlippage, debt)
  )
    .multipliedBy(toAssetData.formattedPriceInMarketReferenceCurrency)
    .toString(10);
  const debtLeftInMarketReference = valueToBigNumber(
    user.totalBorrowsMarketReferenceCurrency
  ).minus(fromAmountInMarketReferenceCurrency);

  const hfAfterRepayBeforeWithdraw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralMarketReferenceCurrency,
    borrowBalanceMarketReferenceCurrency: debtLeftInMarketReference,
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });

  const hfRealEffectOfFromAmount =
    fromAssetData.usageAsCollateralEnabled && repayWithUserReserve?.usageAsCollateralEnabledOnUser
      ? calculateHealthFactorFromBalancesBigUnits({
          collateralBalanceMarketReferenceCurrency: valueToBigNumber(
            fromAmountAfterSlippage
          ).multipliedBy(fromAssetData.priceInMarketReferenceCurrency),
          borrowBalanceMarketReferenceCurrency: debtLeftInMarketReference,
          currentLiquidationThreshold: fromAssetData.reserveLiquidationThreshold,
        }).toString()
      : '0';

  const hfAfterSwap = hfAfterRepayBeforeWithdraw.eq(-1)
    ? hfAfterRepayBeforeWithdraw
    : hfAfterRepayBeforeWithdraw.minus(hfRealEffectOfFromAmount);

  // const hfEffectOfToAmount = calculateHealthFactorFromBalancesBigUnits({
  //   collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
  //   borrowBalanceMarketReferenceCurrency: valueToBigNumber(
  //     user.totalBorrowsMarketReferenceCurrency
  //   ).minus(
  //     valueToBigNumber(toAssetData.priceInMarketReferenceCurrency).multipliedBy(amountToRepay)
  //   ),
  //   currentLiquidationThreshold: toAssetData.formattedReserveLiquidationThreshold,
  // }).toString(10);

  console.log(`
    hf org           : ${user.healthFactor}
    hf initial       : ${hfInitialEffectOfFromAmount}
    hf after before  : ${hfAfterRepayBeforeWithdraw}
    hf real after    : ${hfRealEffectOfFromAmount}
    hf af            : ${hfAfterSwap}
  `);

  return {
    hfEffectOfFromAmount: valueToBigNumber(hfInitialEffectOfFromAmount),
    hfAfterSwap,
    // valueToBigNumber(user.healthFactor)
    //   .plus(hfEffectOfToAmount)
    //   .minus(hfEffectOfFromAmount),
  };
};
