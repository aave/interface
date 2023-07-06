import {
  FormatUserSummaryAndIncentivesResponse,
  normalize,
  valueToBigNumber,
  valueToZDBigNumber,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export function getDebtSwitchInfo(
  sourceReserve: ComputedReserveData,
  targetReserve: ComputedReserveData,
  fromAmount: string,
  toAmount: string,
  user: FormatUserSummaryAndIncentivesResponse,
  marketReferenceCurrencyDecimals: number
): {
  availableLiquidityOfTargetReserve: string;
  futureLTV: string;
} {
  const fromAmountInMarketReferenceCurrency = normalize(
    valueToZDBigNumber(fromAmount).multipliedBy(sourceReserve.priceInMarketReferenceCurrency),
    marketReferenceCurrencyDecimals
  );

  const toAmountInMarketReferenceCurrency = normalize(
    valueToZDBigNumber(toAmount).multipliedBy(targetReserve.priceInMarketReferenceCurrency),
    marketReferenceCurrencyDecimals
  );

  let totalBorrowsMarketReferenceCurrency = valueToZDBigNumber('0');
  user.userReservesData.forEach((r) => {
    let totalReserveBorrows = valueToZDBigNumber(r.stableBorrowsMarketReferenceCurrency).plus(
      r.variableBorrowsMarketReferenceCurrency
    );

    if (r.underlyingAsset === sourceReserve.underlyingAsset) {
      totalReserveBorrows = totalReserveBorrows.minus(fromAmountInMarketReferenceCurrency);
    }
    if (r.underlyingAsset === targetReserve.underlyingAsset) {
      totalReserveBorrows = totalReserveBorrows.plus(toAmountInMarketReferenceCurrency);
    }

    totalBorrowsMarketReferenceCurrency =
      totalBorrowsMarketReferenceCurrency.plus(totalReserveBorrows);
  });

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === '0'
      ? '0'
      : valueToBigNumber(totalBorrowsMarketReferenceCurrency)
          .dividedBy(user?.totalCollateralMarketReferenceCurrency || '1')
          .toFixed();

  const availableBorrowCap =
    targetReserve.borrowCap === '0'
      ? valueToBigNumber(ethers.constants.MaxUint256.toString())
      : valueToBigNumber(Number(targetReserve.borrowCap)).minus(
          valueToBigNumber(targetReserve.totalDebt)
        );
  const availableLiquidity = BigNumber.max(
    BigNumber.min(targetReserve.formattedAvailableLiquidity, availableBorrowCap),
    0
  );

  return {
    availableLiquidityOfTargetReserve: availableLiquidity.toString(),
    futureLTV: loanToValue,
  };
}
