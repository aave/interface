import { FormatReserveUSDResponse, valueToBigNumber, valueToZDBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

interface UserReserveTotalsRequest {
  userReserves: FormattedUserReserves[];
  userEmodeCategoryId: number;
}

interface UserReserveTotalsResponse {
  totalLiquidityMarketReferenceCurrency: BigNumber;
  totalBorrowsMarketReferenceCurrency: BigNumber;
  totalCollateralMarketReferenceCurrency: BigNumber;
  currentLtv: BigNumber;
  currentLiquidationThreshold: BigNumber;
  isInIsolationMode: boolean;
  isolatedReserve?: FormatReserveUSDResponse;
}

export function calculateUserReserveTotals({
  userReserves,
  userEmodeCategoryId,
}: UserReserveTotalsRequest): UserReserveTotalsResponse {
  let totalLiquidityMarketReferenceCurrency = valueToZDBigNumber('0');
  let totalCollateralMarketReferenceCurrency = valueToZDBigNumber('0');
  let totalBorrowsMarketReferenceCurrency = valueToZDBigNumber('0');
  let currentLtv = valueToBigNumber('0');
  let currentLiquidationThreshold = valueToBigNumber('0');
  let isInIsolationMode = false;
  let isolatedReserve: FormatReserveUSDResponse | undefined;

  userReserves.forEach((userReserveSummary) => {
    totalLiquidityMarketReferenceCurrency = totalLiquidityMarketReferenceCurrency.plus(
      userReserveSummary.underlyingBalanceMarketReferenceCurrency
    );
    totalBorrowsMarketReferenceCurrency = totalBorrowsMarketReferenceCurrency
      .plus(userReserveSummary.variableBorrowsMarketReferenceCurrency)
      .plus(userReserveSummary.stableBorrowsMarketReferenceCurrency);

    if (
      userReserveSummary.reserve.reserveLiquidationThreshold !== '0' &&
      userReserveSummary.usageAsCollateralEnabledOnUser
    ) {
      if (userReserveSummary.reserve.debtCeiling !== '0') {
        isolatedReserve = userReserveSummary.reserve;
        isInIsolationMode = true;
      }

      totalCollateralMarketReferenceCurrency = totalCollateralMarketReferenceCurrency.plus(
        userReserveSummary.underlyingBalanceMarketReferenceCurrency
      );
      if (
        userEmodeCategoryId &&
        userEmodeCategoryId === userReserveSummary.reserve.eModeCategoryId
      ) {
        currentLtv = currentLtv.plus(
          valueToBigNumber(
            userReserveSummary.underlyingBalanceMarketReferenceCurrency
          ).multipliedBy(userReserveSummary.reserve.eModeLtv)
        );
        currentLiquidationThreshold = currentLiquidationThreshold.plus(
          valueToBigNumber(
            userReserveSummary.underlyingBalanceMarketReferenceCurrency
          ).multipliedBy(userReserveSummary.reserve.eModeLiquidationThreshold)
        );
      } else {
        currentLtv = currentLtv.plus(
          valueToBigNumber(
            userReserveSummary.underlyingBalanceMarketReferenceCurrency
          ).multipliedBy(userReserveSummary.reserve.baseLTVasCollateral)
        );
        currentLiquidationThreshold = currentLiquidationThreshold.plus(
          valueToBigNumber(
            userReserveSummary.underlyingBalanceMarketReferenceCurrency
          ).multipliedBy(userReserveSummary.reserve.reserveLiquidationThreshold)
        );
      }
    }
  });

  if (currentLtv.gt(0)) {
    currentLtv = valueToZDBigNumber(currentLtv.div(totalCollateralMarketReferenceCurrency));
  }

  if (currentLiquidationThreshold.gt(0)) {
    currentLiquidationThreshold = valueToZDBigNumber(
      currentLiquidationThreshold.div(totalCollateralMarketReferenceCurrency)
    );
  }

  return {
    totalLiquidityMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency,
    totalCollateralMarketReferenceCurrency,
    currentLtv,
    currentLiquidationThreshold,
    isInIsolationMode,
    isolatedReserve,
  };
}
