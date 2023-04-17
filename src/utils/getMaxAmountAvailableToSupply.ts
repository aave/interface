import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';

import { roundToTokenDecimals } from './utils';

// Subset of ComputedReserveData
interface PoolReserveSupplySubset {
  supplyCap: string;
  debtCeiling: string;
  isolationModeTotalDebt: string;
  totalLiquidity: string;
  isFrozen: boolean;
  decimals: number;
}

export function remainingCap(cap: string, total: string) {
  return cap === '0' ? new BigNumber(-1) : new BigNumber(cap).minus(total);
}

export function getMaxAmountAvailableToSupply(
  walletBalance: string,
  poolReserve: PoolReserveSupplySubset,
  underlyingAsset: string,
  minRemainingBaseToken: string
): string {
  if (poolReserve.isFrozen) {
    return '0';
  }

  // Calculate max amount to supply
  let maxAmountToSupply = valueToBigNumber(walletBalance);

  // keep a bit for other transactions
  if (
    maxAmountToSupply.gt(0) &&
    underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()
  ) {
    maxAmountToSupply = maxAmountToSupply.minus(minRemainingBaseToken);
  }

  // make sure we don't try to supply more then maximum supply cap or debt ceiling
  if (poolReserve.supplyCap !== '0') {
    maxAmountToSupply = BigNumber.min(
      maxAmountToSupply,
      remainingCap(poolReserve.supplyCap, poolReserve.totalLiquidity)
    );
  }
  if (poolReserve.debtCeiling !== '0') {
    maxAmountToSupply = BigNumber.min(
      maxAmountToSupply,
      remainingCap(poolReserve.debtCeiling, poolReserve.isolationModeTotalDebt)
    );
  }

  if (maxAmountToSupply.lte(0)) {
    return '0';
  }

  // Convert amount to smallest allowed precision based on token decimals
  return roundToTokenDecimals(maxAmountToSupply.toString(10), poolReserve.decimals);
}
