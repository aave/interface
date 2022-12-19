import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export function remainingCap(poolReserve: ComputedReserveData) {
  return poolReserve.supplyCap === '0'
    ? new BigNumber(-1)
    : new BigNumber(poolReserve.supplyCap).minus(poolReserve.totalLiquidity).multipliedBy('0.995');
}

export function getMaxAmountAvailableToSupply(
  walletBalance: string,
  poolReserve: ComputedReserveData,
  underlyingAsset: string,
  minRemainingBaseToken: string
): BigNumber {
  if (poolReserve.isFrozen) {
    return valueToBigNumber('0');
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

  // make sure we don't try to supply more then maximum
  if (poolReserve.supplyCap !== '0') {
    maxAmountToSupply = BigNumber.min(maxAmountToSupply, remainingCap(poolReserve));
  }

  if (maxAmountToSupply.lte(0)) {
    maxAmountToSupply = valueToBigNumber('0');
  }
  return maxAmountToSupply;
}
