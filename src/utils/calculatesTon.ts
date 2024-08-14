import BigNumber from 'bignumber.js';
import { BigNumberish, ethers } from 'ethers';
import _ from 'lodash';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
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

    return totalAmount === 0 ? 0 : (weightedSum / totalAmount) * 100;
  } catch (error) {
    return 0;
  }
};

export const formatUnitsTon = (value: BigNumberish, decimals: BigNumberish = 18): string => {
  const bigValue = ethers.BigNumber.from(value);

  return ethers.utils.formatUnits(bigValue, decimals);
};

export const calculateHealthFactor = (
  reserves: FormattedUserReserves[] | FormattedReservesAndIncentives[]
): number => {
  const numerator = reserves.reduce((total, reserve) => {
    const underlyingBalance = parseFloat(reserve?.underlyingBalanceUSD || '0');
    const liquidationThreshold = parseFloat(reserve?.formattedReserveLiquidationThreshold || '0');
    return total + underlyingBalance * liquidationThreshold;
  }, 0);

  const denominator = reserves.reduce((total, reserve) => {
    return total + parseFloat(reserve?.variableBorrows || '0');
  }, 0);

  return denominator === 0 ? 0 : numerator / denominator;
};

export const calculateHFAfterSupplyTon = (
  reserves: FormattedReservesAndIncentives[],
  poolReserve: ComputedReserveData,
  supplyAmountInEth: BigNumber
): string => {
  if (!reserves) return '0';

  const underlyingAsset = poolReserve.underlyingAsset;

  const indexToUpdate = _.findIndex(reserves, { underlyingAsset });

  if (indexToUpdate === -1) {
    throw new Error('Asset not found');
  }

  reserves[indexToUpdate].underlyingBalanceUSD = (
    Number(reserves[indexToUpdate].underlyingBalanceUSD) + Number(supplyAmountInEth.toString())
  ).toString();

  const newHf = calculateHealthFactor(reserves);

  console.log('newHf----', newHf.toString());

  return '2';
};

export const calculateCollateralInUSDAssetTon = (reserves: FormattedUserReserves[]): number => {
  return reserves.reduce((total, item) => {
    const underlyingBalance = parseFloat(item.underlyingBalanceUSD);
    const ltv = parseFloat(item.formattedBaseLTVasCollateral || '0');
    return total + underlyingBalance * ltv;
  }, 0);
};
