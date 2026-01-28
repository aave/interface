import { MarketUserState } from '@aave/client';
import { valueToBigNumber } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
  ReserveWithId,
} from 'src/hooks/app-data-provider/useAppDataProvider';

export const calculateMaxWithdrawAmount = (
  user: ExtendedFormattedUser,
  userReserve: ComputedUserReserveData,
  poolReserve: ComputedReserveData
) => {
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);
  let maxAmountToWithdraw = BigNumber.min(underlyingBalance, unborrowedLiquidity);
  let maxCollateralToWithdrawInETH = valueToBigNumber('0');
  const userEMode = poolReserve.eModes.find((elem) => elem.id === user.userEmodeCategoryId);
  const reserveLiquidationThreshold =
    user.isInEmode && userEMode
      ? userEMode.eMode.formattedLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold;
  // Check if asset has non-zero liquidation threshold (base or in user's e-mode)
  const hasLiquidationThreshold =
    poolReserve.reserveLiquidationThreshold !== '0' ||
    (user.isInEmode && userEMode?.collateralEnabled);
  if (
    userReserve?.usageAsCollateralEnabledOnUser &&
    hasLiquidationThreshold &&
    user.totalBorrowsMarketReferenceCurrency !== '0'
  ) {
    // if we have any borrowings we should check how much we can withdraw to a minimum HF of 1.01
    const excessHF = valueToBigNumber(user.healthFactor).minus('1.01');
    if (excessHF.gt('0')) {
      maxCollateralToWithdrawInETH = excessHF
        .multipliedBy(user.totalBorrowsMarketReferenceCurrency)
        .div(reserveLiquidationThreshold);
    }
    maxAmountToWithdraw = BigNumber.min(
      maxAmountToWithdraw,
      maxCollateralToWithdrawInETH.dividedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    );
  }

  return maxAmountToWithdraw;
};

export const calculateMaxWithdrawAmountSDK = (
  marketUserState: MarketUserState | null | undefined,
  reserveUserState: ReserveWithId['userState'] | undefined,
  poolReserve: ReserveWithId,
  underlyingBalance: BigNumber
) => {
  const unborrowedLiquidity = valueToBigNumber(
    poolReserve.borrowInfo?.availableLiquidity.amount.value ??
      poolReserve.supplyInfo.total.value ??
      '0'
  );
  let maxAmountToWithdraw = BigNumber.min(underlyingBalance, unborrowedLiquidity);

  if (!marketUserState) return maxAmountToWithdraw;

  const userEMode = poolReserve.eModeInfo.find(
    (elem) => elem.categoryId === reserveUserState?.emode?.categoryId
  );
  const reserveLt =
    (reserveUserState?.emode && userEMode
      ? userEMode.liquidationThreshold.value
      : poolReserve.supplyInfo.liquidationThreshold.value) ?? '0';

  const totalDebtBase = valueToBigNumber(marketUserState.totalDebtBase ?? '0');
  const totalCollateralBase = valueToBigNumber(marketUserState.totalCollateralBase ?? '0');
  if (reserveUserState?.canBeCollateral && reserveLt !== '0' && totalDebtBase.gt('0')) {
    const currentLt = valueToBigNumber(marketUserState.currentLiquidationThreshold?.value ?? '0');
    const ltWeightedCollateral = totalCollateralBase.multipliedBy(currentLt);
    const maxCollateralToWithdrawInBase = ltWeightedCollateral
      .minus(totalDebtBase.multipliedBy('1.01'))
      .div(reserveLt);
    if (maxCollateralToWithdrawInBase.gt('0')) {
      maxAmountToWithdraw = BigNumber.min(
        maxAmountToWithdraw,
        maxCollateralToWithdrawInBase.dividedBy(poolReserve.usdExchangeRate)
      );
    }
  }

  return maxAmountToWithdraw;
};
