import { BigNumberish, ethers } from 'ethers';
import _ from 'lodash';
import { FormattedReservesAndIncentives } from 'src/hooks/pool/usePoolFormattedReserves';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

export const calculateAPYTon = (currentLiquidityRate: string) => {
  const value = (1 + Number(currentLiquidityRate) / 31536000) ** 31536000 - 1;
  return value;
};

export const calculateTotalElementTon = <T>(
  data: T[],
  valueKey: keyof T,
  collateralKey?: keyof T
): number => {
  return _.sumBy(data, (item) => {
    if (collateralKey && item[collateralKey] === false) {
      return 0;
    }
    const value = item[valueKey];
    const numericValue = typeof value === 'string' ? parseFloat(value) : (value as number);
    return isNaN(numericValue) ? 0 : numericValue;
  });
};

export const calculateWeightedAvgAPY = <T>(data: T[], balance: keyof T, apy: keyof T): number => {
  try {
    if (!data) return 0;

    let totalAmount = 0;
    let weightedSum = 0;

    data.forEach((item) => {
      const value = item[balance];
      const supplyAPY = item[apy];
      const amount = parseFloat(value as unknown as string);
      totalAmount += Number(amount);
      weightedSum += Number(amount) * Number(supplyAPY);
    });

    return totalAmount === 0 ? 0 : weightedSum / totalAmount;
  } catch (error) {
    return 0;
  }
};

export const formatUnitsTon = (value: BigNumberish, decimals: BigNumberish = 18): string => {
  const bigValue = ethers.BigNumber.from(value);

  return ethers.utils.formatUnits(bigValue, decimals);
};

export const calculateTotalCollateralUSD = (
  reserves: FormattedUserReserves[] | FormattedReservesAndIncentives[],
  getFactor: (reserve: FormattedUserReserves | FormattedReservesAndIncentives) => number
): number => {
  const formattedReserves = reserves as (FormattedUserReserves | FormattedReservesAndIncentives)[];

  const newFormattedReserves = formattedReserves.filter(
    (item: FormattedUserReserves | FormattedReservesAndIncentives) =>
      item.usageAsCollateralEnabledOnUser
  );
  return newFormattedReserves.reduce(
    (total: number, reserve: FormattedUserReserves | FormattedReservesAndIncentives) => {
      const underlyingBalance = parseFloat(reserve?.underlyingBalanceUSD || '0');
      const factor = getFactor(reserve);
      return total + underlyingBalance * factor;
    },
    0
  );
};

export const calculateTotalCollateralMarketReferenceCurrency = (
  reserves: FormattedUserReserves[] | FormattedReservesAndIncentives[]
): number => {
  const formattedReserves = reserves as (FormattedUserReserves | FormattedReservesAndIncentives)[];
  return formattedReserves.reduce(
    (total: number, reserve: FormattedUserReserves | FormattedReservesAndIncentives) => {
      if (reserve.usageAsCollateralEnabledOnUser) {
        const underlyingBalance = parseFloat(reserve?.underlyingBalanceUSD || '0');
        const liquidationThreshold = parseFloat(
          reserve?.formattedReserveLiquidationThreshold || '0'
        );
        return total + underlyingBalance * liquidationThreshold;
      }
      return total;
    },
    0
  );
};
