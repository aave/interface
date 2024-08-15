import { valueToBigNumber } from '@aave/math-utils';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import {
  calculateTotalCollateralMarketReferenceCurrency,
  calculateTotalCollateralUSD,
  calculateTotalElementTon,
  calculateWeightedAvgAPY,
} from './calculatesTon';

export interface RawUserSummaryResponseTon {
  totalCollateralMarketReferenceCurrency: number;
  totalBorrowsMarketReferenceCurrency: number;
  currentLiquidationThreshold: number;
  collateralInUSDAsset: number;
  totalCollateralUSD: number;
  totalLiquidityUSD: number;
  totalBorrowsUSD: number;
  healthFactor: number;
  netWorthUSD: number;
  earnedAPY: number;
  netAPY: number;
}

export interface RawUserSummaryRequestTon {
  userReserves: FormattedUserReserves[];
}

export function generateRawUserSummaryTon({
  userReserves,
}: RawUserSummaryRequestTon): RawUserSummaryResponseTon {
  const totalLiquidityUSD = calculateTotalElementTon(userReserves, 'underlyingBalanceUSD'); // total user supplied - usd
  const totalBorrowsUSD = calculateTotalElementTon(userReserves, 'variableBorrowsUSD'); // total user borrowed - usd
  const earnedAPY = calculateTotalElementTon(userReserves, 'supplyAPY'); // total APY your supplies

  const collateralInUSDAsset = calculateTotalCollateralUSD(userReserves, (reserve) =>
    parseFloat(reserve?.formattedBaseLTVasCollateral || '0')
  ); // Collateral in USD asset a  *  Max LTV asset a

  const totalCollateralMarketReferenceCurrency =
    calculateTotalCollateralMarketReferenceCurrency(userReserves);

  const currentLiquidationThreshold = 0.15;

  const healthFactor =
    totalBorrowsUSD === 0
      ? -1
      : valueToBigNumber(totalCollateralMarketReferenceCurrency)
          .dividedBy(totalBorrowsUSD)
          .toNumber() || -1;

  const totalCollateralUSD = calculateTotalElementTon(
    userReserves,
    'underlyingBalanceUSD',
    'usageAsCollateralEnabledOnUser'
  );

  const weightedAvgSupplyAPY = calculateWeightedAvgAPY(
    userReserves,
    'underlyingBalanceUSD',
    'supplyAPY'
  );

  const weightedAvgBorrowAPY = calculateWeightedAvgAPY(
    userReserves,
    'variableBorrowsUSD',
    'variableBorrowAPY'
  );

  const netWorthUSD = totalLiquidityUSD - totalBorrowsUSD; // Net worth

  const netAPY =
    (weightedAvgSupplyAPY * totalLiquidityUSD) / netWorthUSD -
    (weightedAvgBorrowAPY * totalBorrowsUSD) / netWorthUSD; // Net APY

  const totalBorrowsMarketReferenceCurrency = (totalBorrowsUSD / totalCollateralUSD) * 100 || 0;

  return {
    totalCollateralMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold,
    collateralInUSDAsset,
    totalCollateralUSD,
    totalLiquidityUSD,
    totalBorrowsUSD,
    healthFactor,
    netWorthUSD,
    earnedAPY,
    netAPY,
  };
}
