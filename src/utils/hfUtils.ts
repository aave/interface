import {
  BigNumberValue,
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  UserReserveData,
  valueToBigNumber,
} from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { EmodeCategory } from 'src/helpers/types';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';

export interface CalculateHFAfterSwapProps {
  fromAmount: BigNumberValue;
  fromAssetData: ComputedReserveData;
  fromAssetUserData: ComputedUserReserve;
  fromAssetType: 'collateral' | 'debt' | 'none';
  toAmountAfterSlippage: BigNumberValue;
  toAssetData: ComputedReserveData;
  user: ExtendedFormattedUser;
  toAssetType: 'collateral' | 'debt' | 'none';
  eModes: Record<number, EmodeCategory>;
}

interface CalculateHFAfterSwapRepayProps {
  amountToReceiveAfterSwap: BigNumberValue;
  amountToSwap: BigNumberValue;
  fromAssetData: ComputedReserveData;
  toAssetData: ComputedReserveData;
  user: ExtendedFormattedUser;
  repayWithUserReserve?: UserReserveData;
  debt: string;
}

interface CalculateHFAfterWithdrawProps {
  user: ExtendedFormattedUser;
  userReserve: ComputedUserReserveData;
  poolReserve: ComputedReserveData;
  withdrawAmount: string;
}

/**
 * v3.7 isolated eMode rule: assets outside the target category's collateralBitmap
 * get their effective LTV forced to 0 (liquidation threshold is unaffected).
 * The deprecated @aave/math-utils calculateUserReserveTotals doesn't know about `isolated`
 * and falls back to `baseLTVasCollateral` for any asset without an in-bitmap eMode entry.
 * This pre-shapes the reserves passed into formatUserSummary/formatUserSummaryAndIncentives
 * so that existing, unmodified math-utils logic produces the correct effective LTV.
 */
export function getEmodeAdjustedReserves<
  T extends {
    eModes: { id: number; collateralEnabled: boolean }[];
    baseLTVasCollateral: string;
  }
>(reserves: T[], targetEmodeId: number, eModes: Record<number, EmodeCategory>): T[] {
  if (!targetEmodeId || !eModes[targetEmodeId]?.isolated) return reserves;
  return reserves.map((reserve) => {
    const inCollateralBitmap = reserve.eModes.find(
      (e) => e.id === targetEmodeId
    )?.collateralEnabled;
    return inCollateralBitmap ? reserve : { ...reserve, baseLTVasCollateral: '0' };
  });
}

/**
 * Mirrors the on-chain ValidationLogic.getUserReserveLtv step order: in-bitmap collateral
 * (minus ltvzero) first, then the v3.7 isolated rule (outside collateralBitmap -> LTV0),
 * then the pre-3.7 base-LTV fallback. Liquidation threshold is never affected by `isolated`
 * and is not part of this helper.
 */
export function hasNonZeroEffectiveLtv({
  baseLTVasCollateral,
  isInEmode,
  emodeEntry,
  isEModeIsolated,
}: {
  baseLTVasCollateral: string;
  isInEmode: boolean;
  emodeEntry?: { collateralEnabled: boolean; ltvzeroEnabled: boolean };
  isEModeIsolated: boolean;
}): boolean {
  if (!isInEmode) return baseLTVasCollateral !== '0';
  if (emodeEntry?.collateralEnabled) return !emodeEntry.ltvzeroEnabled;
  if (isEModeIsolated) return false;
  return baseLTVasCollateral !== '0';
}

export function calculateHFAfterSwap({
  fromAmount,
  fromAssetData,
  fromAssetUserData,
  fromAssetType,
  toAmountAfterSlippage,
  toAssetData,
  user,
  toAssetType,
  eModes,
}: CalculateHFAfterSwapProps) {
  // Base balances
  const currentCollateral = valueToBigNumber(user.totalCollateralMarketReferenceCurrency);
  const currentBorrows = valueToBigNumber(user.totalBorrowsMarketReferenceCurrency);

  // Check if asset has non-zero liquidation threshold (base or in user's e-mode)
  const fromEmode = fromAssetData.eModes.find((elem) => elem.id === user.userEmodeCategoryId);
  const hasFromLiquidationThreshold =
    fromAssetData.reserveLiquidationThreshold !== '0' ||
    (user.isInEmode && fromEmode?.collateralEnabled);

  // Collateral changes
  const canWithdrawFromCollateral =
    fromAssetType === 'collateral' &&
    fromAssetUserData.usageAsCollateralEnabledOnUser &&
    hasFromLiquidationThreshold;
  // Mirrors getUserReserveLtv on-chain: effective LTV is non-zero when base LTV > 0,
  // or when the user is in an e-mode where this asset is collateralEnabled and not
  // in the ltvzeroBitmap. An asset with zero effective LTV is not auto-enabled as
  // collateral on supply (validateAutomaticUseAsCollateral returns false), so it must
  // be excluded from the HF simulation to avoid inflating the projected HF.
  const toEmode = toAssetData.eModes.find((elem) => elem.id === user.userEmodeCategoryId);
  const hasToEffectiveLtv = hasNonZeroEffectiveLtv({
    baseLTVasCollateral: toAssetData.baseLTVasCollateral,
    isInEmode: user.isInEmode,
    emodeEntry: toEmode,
    isEModeIsolated: !!eModes[user.userEmodeCategoryId]?.isolated,
  });
  const canAddToCollateral =
    toAssetType === 'collateral' &&
    hasToEffectiveLtv &&
    ((!user.isInIsolationMode && !toAssetData.isIsolated) ||
      (user.isInIsolationMode &&
        user.isolatedReserve?.underlyingAsset === toAssetData.underlyingAsset));

  const withdrawCollateralMR = canWithdrawFromCollateral
    ? valueToBigNumber(fromAmount).multipliedBy(
        fromAssetData.formattedPriceInMarketReferenceCurrency
      )
    : valueToBigNumber('0');
  const addCollateralMR = canAddToCollateral
    ? valueToBigNumber(toAmountAfterSlippage).multipliedBy(
        toAssetData.formattedPriceInMarketReferenceCurrency
      )
    : valueToBigNumber('0');

  // Debt changes
  const repayFromDebtMR =
    fromAssetType === 'debt'
      ? valueToBigNumber(fromAmount).multipliedBy(
          fromAssetData.formattedPriceInMarketReferenceCurrency
        )
      : valueToBigNumber('0');
  const toDebtMR =
    toAssetType === 'debt'
      ? valueToBigNumber(toAmountAfterSlippage).multipliedBy(
          toAssetData.formattedPriceInMarketReferenceCurrency
        )
      : valueToBigNumber('0');
  const repayToDebtMR =
    fromAssetType === 'collateral' && toAssetType === 'debt' ? toDebtMR : valueToBigNumber('0');
  const borrowToDebtMR =
    fromAssetType === 'debt' && toAssetType === 'debt' ? toDebtMR : valueToBigNumber('0');

  const newBorrows = BigNumber.max(
    currentBorrows.minus(repayFromDebtMR).minus(repayToDebtMR).plus(borrowToDebtMR),
    valueToBigNumber('0')
  );
  const newCollateral = currentCollateral.minus(withdrawCollateralMR).plus(addCollateralMR);

  if (newCollateral.lte(0)) {
    return { hfEffectOfFromAmount: '0', hfAfterSwap: valueToBigNumber('-1') };
  }

  const toEMode = toAssetData.eModes.find((elem) => elem.id === user.userEmodeCategoryId);
  const fromReserveLT =
    user.isInEmode && fromEmode
      ? fromEmode.eMode.formattedLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold;
  const toReserveLT =
    user.isInEmode && toEMode
      ? toEMode.eMode.formattedLiquidationThreshold
      : toAssetData.formattedReserveLiquidationThreshold;

  const ltTotalBefore = valueToBigNumber(user.totalCollateralMarketReferenceCurrency).multipliedBy(
    user.currentLiquidationThreshold
  );
  const ltAfter = ltTotalBefore
    .minus(withdrawCollateralMR.multipliedBy(fromReserveLT))
    .plus(addCollateralMR.multipliedBy(toReserveLT))
    .div(newCollateral)
    .toFixed(4);

  const hfAfterSwap = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: newCollateral,
    borrowBalanceMarketReferenceCurrency: newBorrows,
    currentLiquidationThreshold: ltAfter,
  });

  // For gating flashloan flow: how risky is withdrawing the from collateral amount on its own
  let hfEffectOfFromAmount = '0';
  if (canWithdrawFromCollateral) {
    hfEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(fromAmount).multipliedBy(
        fromAssetData.formattedPriceInMarketReferenceCurrency
      ),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: fromReserveLT,
    }).toString();
  }

  return { hfEffectOfFromAmount, hfAfterSwap };
}

export const calculateHFAfterRepay = ({
  user,
  amountToReceiveAfterSwap,
  amountToSwap,
  fromAssetData,
  toAssetData,
  repayWithUserReserve,
  debt,
}: CalculateHFAfterSwapRepayProps) => {
  const fromEmode = fromAssetData.eModes.find((elem) => elem.id === user.userEmodeCategoryId);
  // Check if asset has non-zero liquidation threshold (base or in user's e-mode)
  const hasFromLiquidationThreshold =
    fromAssetData.reserveLiquidationThreshold !== '0' ||
    (user.isInEmode && fromEmode?.collateralEnabled);
  // it takes into account if in emode as threshold is different
  const reserveLiquidationThreshold =
    user.isInEmode && fromEmode
      ? fromEmode.eMode.formattedLiquidationThreshold
      : fromAssetData.formattedReserveLiquidationThreshold;

  // hf indicating how the state would be if we withdrew this amount.
  // this is needed because on contracts hf can't be < 1 so in the case
  // that fromHF < 1 we need to do a flashloan to not go below
  let hfInitialEffectOfFromAmount = '0';

  if (
    repayWithUserReserve?.usageAsCollateralEnabledOnUser &&
    fromAssetData.usageAsCollateralEnabled
  ) {
    hfInitialEffectOfFromAmount = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(amountToSwap).multipliedBy(
        fromAssetData.formattedPriceInMarketReferenceCurrency
      ),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: reserveLiquidationThreshold,
    }).toString();
  }

  const fromAmountInMarketReferenceCurrency = valueToBigNumber(
    BigNumber.min(amountToReceiveAfterSwap, debt)
  )
    .multipliedBy(toAssetData.priceInUSD)
    .toString(10);
  let debtLeftInMarketReference = valueToBigNumber(user.totalBorrowsUSD).minus(
    fromAmountInMarketReferenceCurrency
  );

  debtLeftInMarketReference = BigNumber.max(debtLeftInMarketReference, valueToBigNumber('0'));

  const hfAfterRepayBeforeWithdraw = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: debtLeftInMarketReference.toString(10),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });

  const hfRealEffectOfFromAmount =
    hasFromLiquidationThreshold && repayWithUserReserve?.usageAsCollateralEnabledOnUser
      ? calculateHealthFactorFromBalancesBigUnits({
          collateralBalanceMarketReferenceCurrency: valueToBigNumber(amountToSwap).multipliedBy(
            fromAssetData.priceInUSD
          ),
          borrowBalanceMarketReferenceCurrency: debtLeftInMarketReference.toString(10),
          currentLiquidationThreshold: reserveLiquidationThreshold,
        }).toString()
      : '0';

  const hfAfterSwap = hfAfterRepayBeforeWithdraw.eq(-1)
    ? hfAfterRepayBeforeWithdraw
    : hfAfterRepayBeforeWithdraw.minus(hfRealEffectOfFromAmount);

  return {
    hfEffectOfFromAmount: valueToBigNumber(hfInitialEffectOfFromAmount),
    hfAfterSwap: hfAfterSwap.isLessThan(0) && !hfAfterSwap.eq(-1) ? 0 : hfAfterSwap,
  };
};

export const calculateHFAfterWithdraw = ({
  user,
  userReserve,
  poolReserve,
  withdrawAmount,
}: CalculateHFAfterWithdrawProps) => {
  let totalCollateralInETHAfterWithdraw = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  );
  let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold;
  let healthFactorAfterWithdraw = valueToBigNumber(user.healthFactor);

  const userEMode = poolReserve.eModes.find((elem) => elem.id === user.userEmodeCategoryId);

  const reserveLiquidationThreshold =
    user.isInEmode && userEMode
      ? userEMode.eMode.formattedLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold;

  // Check if asset has non-zero liquidation threshold (base or in user's e-mode)
  const hasLiquidationThreshold =
    poolReserve.reserveLiquidationThreshold !== '0' ||
    (user.isInEmode && userEMode?.collateralEnabled);

  if (userReserve?.usageAsCollateralEnabledOnUser && hasLiquidationThreshold) {
    const amountToWithdrawInEth = valueToBigNumber(withdrawAmount).multipliedBy(
      poolReserve.formattedPriceInMarketReferenceCurrency
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

    healthFactorAfterWithdraw = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: totalCollateralInETHAfterWithdraw,
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
    });
  }

  return healthFactorAfterWithdraw;
};

export const calculateHFAfterSupply = (
  user: ExtendedFormattedUser,
  poolReserve: ComputedReserveData,
  supplyAmountInEth: BigNumber,
  eModes: Record<number, EmodeCategory>
) => {
  let healthFactorAfterDeposit = user ? valueToBigNumber(user.healthFactor) : '-1';

  const userEmode = user
    ? poolReserve.eModes.find((e) => e.id === user.userEmodeCategoryId)
    : undefined;

  // Mirrors validateUseAsCollateral on-chain: asset is only auto-enabled as collateral
  // when effective LTV > 0. Base LTV covers the non-emode path; emode collateral without
  // ltvzero covers the boosted path (ltvzero assets have 0 LTV and won't be enabled).
  const hasEffectiveLtv = user
    ? hasNonZeroEffectiveLtv({
        baseLTVasCollateral: poolReserve.baseLTVasCollateral,
        isInEmode: user.isInEmode,
        emodeEntry: userEmode,
        isEModeIsolated: !!eModes[user.userEmodeCategoryId]?.isolated,
      })
    : false;

  const additionalCollateral = hasEffectiveLtv ? supplyAmountInEth : valueToBigNumber(0);

  // Use emode-boosted LT when user is in emode and asset is in that category's collateral bitmap.
  const reserveLiquidationThreshold =
    user?.isInEmode && userEmode?.collateralEnabled
      ? userEmode.eMode.formattedLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold;

  const totalCollateralMarketReferenceCurrencyAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).plus(additionalCollateral)
    : '-1';

  const liquidationThresholdAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
        .multipliedBy(user.currentLiquidationThreshold)
        .plus(additionalCollateral.multipliedBy(reserveLiquidationThreshold))
        .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
    : '-1';

  if (
    user &&
    ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
      (user.isInIsolationMode &&
        user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset))
  ) {
    healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyAfter,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(
        user.totalBorrowsMarketReferenceCurrency
      ),
      currentLiquidationThreshold: liquidationThresholdAfter,
    });
  }

  return healthFactorAfterDeposit;
};
