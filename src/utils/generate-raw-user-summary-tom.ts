import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { calculateTotalElementTon, calculateWeightedAvgAPY } from './calculatesTon';

export interface RawUserSummaryResponseTon {
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
  const totalLiquidityUSD = calculateTotalElementTon(userReserves, 'underlyingBalanceUSD');

  const earnedAPY = calculateTotalElementTon(userReserves, 'supplyAPY'); // total APY your supplies

  const totalCollateralUSD = calculateTotalElementTon(
    userReserves,
    'underlyingBalanceUSD',
    'usageAsCollateralEnabledOnUser'
  );

  const totalBorrowsUSD = 20;

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

  const healthFactor = 111;

  return {
    totalCollateralUSD,
    totalLiquidityUSD,
    totalBorrowsUSD,
    healthFactor,
    netWorthUSD,
    earnedAPY,
    netAPY,
  };
}
