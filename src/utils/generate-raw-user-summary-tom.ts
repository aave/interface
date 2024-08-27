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
  availableBorrowsUSD: number;
  totalCollateralUSD: number;
  isInIsolationMode: boolean;
  currentLoanToValue: BigNumber;
  totalLiquidityUSD: number;
  totalBorrowsUSD: number;
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

  const totalLiquidityUSD = calculateTotalElementTon(userReserves, 'underlyingBalanceUSD'); // total user supplied - usd
  const totalBorrowsUSD = calculateTotalElementTon(userReserves, 'variableBorrowsUSD'); // total user borrowed - usd
  const earnedAPY = calculateTotalElementTon(userReserves, 'supplyAPY'); // total APY your supplies

  const collateralInUSDAsset = calculateTotalCollateralUSD(userReserves, (reserve) =>
    parseFloat(reserve?.formattedBaseLTVasCollateral || '0')
  ); // Collateral in USD asset a  *  Max LTV asset a

  const healthFactor = calculateHealthFactorFromBalances({
    collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrency,
    borrowBalanceMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold,
  });

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

  const netWorthUSD = Number(valueToBigNumber(totalLiquidityUSD).minus(totalBorrowsUSD)); // Net worth

  const netAPY =
    (weightedAvgSupplyAPY * totalLiquidityUSD) / netWorthUSD -
    (weightedAvgBorrowAPY * totalBorrowsUSD) / netWorthUSD; // Net APY

  const currentLoanToValue = currentLtv;

  const debtAPY = Number(weightedAvgBorrowAPY);

  const availableBorrowsUSD = Number(valueToBigNumber(totalCollateralUSD).minus(totalBorrowsUSD));

  const availableBorrowsMarketReferenceCurrency = calculateAvailableBorrowsMarketReferenceCurrency({
    collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrency,
    borrowBalanceMarketReferenceCurrency: totalBorrowsMarketReferenceCurrency,
    currentLtv,
  });

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
