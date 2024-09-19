import { calculateCompoundedInterest, rayMul } from '@aave/math-utils';
import BigNumber from 'bignumber.js';

export interface CalculateReserveDebtRequest {
  totalScaledVariableDebt: string;
  variableBorrowIndex: string;
  totalPrincipalStableDebt: string;
  availableLiquidity: string;
  variableBorrowRate: string;
  lastUpdateTimestamp: number;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: number;
  virtualUnderlyingBalance: string;
}

export interface CalculateReserveDebtResponse {
  totalVariableDebt: BigNumber;
  totalStableDebt: BigNumber;
  totalDebt: BigNumber;
  totalLiquidity: BigNumber;
}

export function calculateReserveDebt(
  reserveDebt: CalculateReserveDebtRequest,
  currentTimestamp: number
): CalculateReserveDebtResponse {
  const totalVariableDebt = getTotalVariableDebt(reserveDebt, currentTimestamp);
  const totalStableDebt = getTotalStableDebt(reserveDebt, currentTimestamp);
  const totalDebt = totalVariableDebt.plus(totalStableDebt);
  const totalLiquidity = totalDebt.plus(reserveDebt.availableLiquidity);

  return {
    totalVariableDebt,
    totalStableDebt,
    totalDebt,
    totalLiquidity,
  };
}

function getTotalVariableDebt(
  reserveDebt: CalculateReserveDebtRequest,
  currentTimestamp: number
): BigNumber {
  return rayMul(
    rayMul(reserveDebt.totalScaledVariableDebt, reserveDebt.variableBorrowIndex),
    calculateCompoundedInterest({
      rate: reserveDebt.variableBorrowRate,
      currentTimestamp,
      lastUpdateTimestamp: reserveDebt.lastUpdateTimestamp,
    })
  );
}

function getTotalStableDebt(
  reserveDebt: CalculateReserveDebtRequest,
  currentTimestamp: number
): BigNumber {
  return rayMul(
    reserveDebt.totalPrincipalStableDebt,
    calculateCompoundedInterest({
      rate: reserveDebt.averageStableRate,
      currentTimestamp,
      lastUpdateTimestamp: reserveDebt.stableDebtLastUpdateTimestamp,
    })
  );
}
