import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';

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

  // make sure we don't try to supply more then maximum supply cap
  if (poolReserve.supplyCap !== '0') {
    maxAmountToSupply = BigNumber.min(
      maxAmountToSupply,
      remainingCap(poolReserve.supplyCap, poolReserve.totalLiquidity)
    );
  }

  if (maxAmountToSupply.lte(0)) {
    return '0';
  }

  // Convert amount to smallest allowed precision based on token decimals
  return roundToTokenDecimals(maxAmountToSupply.toString(10), poolReserve.decimals);
}

export const getMaxAmountAvailableToSupplySDK = ({
  walletBalance,
  reserve,
  isNativeSelected,
  minRemainingBaseTokenBalance,
}: {
  walletBalance: string; // balance ya normalizado a decimales del token
  reserve: ReserveWithId;
  isNativeSelected: boolean;
  minRemainingBaseTokenBalance: string;
}) => {
  // 1) saldo de wallet, dejando buffer si es nativo
  const walletAfterBuffer = isNativeSelected
    ? BigNumber.max(
        valueToBigNumber(walletBalance).minus(minRemainingBaseTokenBalance),
        0
      ).toString()
    : walletBalance;

  // 2) límite de protocolo (caps/debt ceiling/estado user) ya calculado por el SDK
  const protocolLimit = reserve.userState?.suppliable.amount.value ?? '0';

  // 3) máximo final = mínimo entre saldo y límite
  return BigNumber.min(walletAfterBuffer, protocolLimit).toString();
};
