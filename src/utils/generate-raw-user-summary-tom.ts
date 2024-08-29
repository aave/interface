import {
  calculateAvailableBorrowsMarketReferenceCurrency,
  calculateHealthFactorFromBalances,
  FormatReserveUSDResponse,
  valueToBigNumber,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { calculateUserReserveTotals } from './calculate-user-reserve-totals';
import {
  calculateTotalCollateralUSD,
  calculateTotalElementTon,
  calculateWeightedAvgAPY,
} from './calculatesTon';
import { normalizedToUsd } from './usd/normalized-to-usd';

export interface RawUserSummaryResponseTon {
  availableBorrowsMarketReferenceCurrency: BigNumber;
  totalCollateralMarketReferenceCurrency: BigNumber;
  totalBorrowsMarketReferenceCurrency: BigNumber;
  currentLiquidationThreshold: BigNumber;
  collateralInUSDAsset: number;
  availableBorrowsUSD: BigNumber;
  totalCollateralUSD: BigNumber;
  isInIsolationMode: boolean;
  currentLoanToValue: BigNumber;
  totalLiquidityUSD: BigNumber;
  totalBorrowsUSD: BigNumber;
  healthFactor: BigNumber;
  netWorthUSD: number;
  earnedAPY: number;
  debtAPY: number;
  netAPY: number;
  isolatedReserve: FormatReserveUSDResponse | undefined;
  currentLtv: BigNumber;
  totalLiquidityMarketReferenceCurrency: BigNumber;
}

export interface RawUserSummaryRequestTon {
  userReserves: FormattedUserReserves[];
  userEmodeCategoryId: number;
}

export function generateRawUserSummaryTon({
  userReserves,
  userEmodeCategoryId,
}: RawUserSummaryRequestTon): RawUserSummaryResponseTon {
  // const marketReferencePriceInUsd = 10 ** 9; // 10
  // const marketReferenceCurrencyDecimals = 18;

  const {
    totalLiquidityMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency,
    totalCollateralMarketReferenceCurrency,
    currentLtv,
    currentLiquidationThreshold,
    isInIsolationMode,
    isolatedReserve,
  } = calculateUserReserveTotals({ userReserves, userEmodeCategoryId });

  const totalLiquidityUSD = totalLiquidityMarketReferenceCurrency; // total user supplied - usd
  const totalBorrowsUSD = totalBorrowsMarketReferenceCurrency; // total user borrowed - usd
  const earnedAPY = calculateTotalElementTon(userReserves, 'supplyAPY'); // total APY your supplies

  const collateralInUSDAsset = calculateTotalCollateralUSD(userReserves, (reserve) =>
    parseFloat(reserve?.formattedBaseLTVasCollateral || '0')
  ); // Collateral in USD asset a  *  Max LTV asset a

  const healthFactor = calculateHealthFactorFromBalances({
    collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrency,
    borrowBalanceMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold,
  });
  console.log('🚀 ~ healthFactor:', healthFactor.toString());

  const totalCollateralUSD = totalCollateralMarketReferenceCurrency;

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

  const netWorthUSD = Number(valueToBigNumber(totalLiquidityUSD).minus(totalBorrowsUSD)); // Net worth

  const netAPY =
    (weightedAvgSupplyAPY * Number(totalLiquidityUSD)) / netWorthUSD -
    (weightedAvgBorrowAPY * Number(totalBorrowsUSD)) / netWorthUSD; // Net APY

  const currentLoanToValue = currentLtv;

  const debtAPY = Number(weightedAvgBorrowAPY);

  const availableBorrowsMarketReferenceCurrency = calculateAvailableBorrowsMarketReferenceCurrency({
    collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrency,
    borrowBalanceMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency,
    currentLtv,
  });

  const availableBorrowsUSD = availableBorrowsMarketReferenceCurrency;

  return {
    availableBorrowsMarketReferenceCurrency,
    totalCollateralMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold,
    collateralInUSDAsset,
    availableBorrowsUSD,
    totalCollateralUSD,
    currentLoanToValue,
    isInIsolationMode,
    totalLiquidityUSD,
    totalBorrowsUSD,
    healthFactor,
    netWorthUSD,
    earnedAPY,
    debtAPY,
    netAPY,
    isolatedReserve,
    currentLtv,
    totalLiquidityMarketReferenceCurrency,
  };
}
