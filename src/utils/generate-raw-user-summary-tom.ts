import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import {
  calculateCollateralInUSDAssetTon,
  calculateHealthFactor,
  calculateTotalElementTon,
  calculateWeightedAvgAPY,
} from './calculatesTon';

export interface RawUserSummaryResponseTon {
  totalCollateralMarketReferenceCurrency: number;
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

  const collateralInUSDAsset = calculateCollateralInUSDAssetTon(userReserves); // Collateral in USD asset a  *  Max LTV asset a

  const healthFactor = calculateHealthFactor(userReserves);

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

  const totalCollateralMarketReferenceCurrency = 11;

  return {
    totalCollateralMarketReferenceCurrency,
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
