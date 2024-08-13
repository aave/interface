import { BigNumberish, ethers } from 'ethers';
import _ from 'lodash';

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

    return totalAmount === 0 ? 0 : (weightedSum / totalAmount) * 100;
  } catch (error) {
    return 0;
  }
};

export function formatUnitsTon(value: BigNumberish, decimals: BigNumberish = 18): string {
  const bigValue = ethers.BigNumber.from(value);

  return ethers.utils.formatUnits(bigValue, decimals);
}
