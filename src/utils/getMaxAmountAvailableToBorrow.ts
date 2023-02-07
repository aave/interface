import { InterestRate } from '@aave/contract-helpers';
import { FormatUserSummaryAndIncentivesResponse, valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';

import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from '../hooks/app-data-provider/useAppDataProvider';

/**
 * Calculates the maximum amount a user can borrow.
 * @param poolReserve
 * @param userReserve
 * @param user
 */
export function getMaxAmountAvailableToBorrow(
  poolReserve: ComputedReserveData,
  user: FormatUserSummaryAndIncentivesResponse,
  rateMode: InterestRate
) {
  const availableInPoolUSD = poolReserve.availableLiquidityUSD;
  const availableForUserUSD = BigNumber.min(user.availableBorrowsUSD, availableInPoolUSD);

  const availableBorrowCap =
    poolReserve.borrowCap === '0'
      ? valueToBigNumber(ethers.constants.MaxUint256.toString())
      : valueToBigNumber(Number(poolReserve.borrowCap)).minus(
          valueToBigNumber(poolReserve.totalDebt)
        );
  const availableLiquidity = BigNumber.max(
    BigNumber.min(poolReserve.availableLiquidity, availableBorrowCap),
    0
  );

  let maxUserAmountToBorrow = BigNumber.min(
    valueToBigNumber(user?.availableBorrowsMarketReferenceCurrency || 0).div(
      poolReserve.formattedPriceInMarketReferenceCurrency
    ),
    availableLiquidity.toString()
  );

  if (rateMode === InterestRate.Stable) {
    maxUserAmountToBorrow = BigNumber.min(
      maxUserAmountToBorrow,
      // TODO: put MAX_STABLE_RATE_BORROW_SIZE_PERCENT on uipooldataprovider instead of using the static value here
      valueToBigNumber(poolReserve.formattedAvailableLiquidity).multipliedBy(0.25)
    );
  }

  const shouldAddMargin =
    /**
     * When a user has borrows we assume the debt is increasing faster then the supply.
     * That's a simplification that might not be true, but doesn't matter in most cases.
     */
    (user.totalBorrowsMarketReferenceCurrency !== '0' &&
      availableForUserUSD.lt(availableInPoolUSD)) ||
    /**
     * When the user could in theory borrow all, but the debt accrues the available decreases from block to block.
     */
    (availableForUserUSD.eq(availableInPoolUSD) && poolReserve.totalDebt !== '0') ||
    /**
     * When borrow cap could be reached and debt accumulates the debt would be surpassed.
     */
    (poolReserve.borrowCapUSD &&
      poolReserve.totalDebt !== '0' &&
      availableForUserUSD.gte(availableInPoolUSD)) ||
    /**
     * When the user would be able to borrow all the remaining ceiling we need to add a margin as existing debt.
     */
    (user.isInIsolationMode &&
      user.isolatedReserve?.isolationModeTotalDebt !== '0' &&
      // TODO: would be nice if userFormatter contained formatted reserve as this math is done twice now
      valueToBigNumber(user.isolatedReserve?.debtCeiling || '0')
        .minus(user.isolatedReserve?.isolationModeTotalDebt || '0')
        .shiftedBy(-(user.isolatedReserve?.debtCeilingDecimals || 0))
        .multipliedBy('0.99')
        .lt(user.availableBorrowsUSD));

  return shouldAddMargin ? maxUserAmountToBorrow.multipliedBy('0.99') : maxUserAmountToBorrow;
}

/**
 * Calculates the maximum amount of GHO a user can mint
 * @param user
 */
export function getMaxGhoMintAmount(user: FormatUserSummaryAndIncentivesResponse) {
  const maxUserAmountToMint = valueToBigNumber(user?.availableBorrowsMarketReferenceCurrency || 0);

  const shouldAddMargin =
    /**
     * When a user has borrows we assume the debt is increasing faster then the supply.
     * That's a simplification that might not be true, but doesn't matter in most cases.
     */
    user.totalBorrowsMarketReferenceCurrency !== '0' ||
    /**
     * When the user would be able to borrow all the remaining ceiling we need to add a margin as existing debt.
     */
    (user.isInIsolationMode &&
      user.isolatedReserve?.isolationModeTotalDebt !== '0' &&
      // TODO: would be nice if userFormatter contained formatted reserve as this math is done twice now
      valueToBigNumber(user.isolatedReserve?.debtCeiling || '0')
        .minus(user.isolatedReserve?.isolationModeTotalDebt || '0')
        .shiftedBy(-(user.isolatedReserve?.debtCeilingDecimals || 0))
        .multipliedBy('0.99')
        .lt(user.availableBorrowsUSD));

  return shouldAddMargin ? maxUserAmountToMint.multipliedBy('0.99') : maxUserAmountToMint;
}

export function assetCanBeBorrowedByUser(
  {
    borrowingEnabled,
    isActive,
    borrowableInIsolation,
    eModeCategoryId,
    isFrozen,
  }: ComputedReserveData,
  user: ExtendedFormattedUser
) {
  if (!borrowingEnabled || !isActive || isFrozen) return false;
  if (user?.isInEmode && eModeCategoryId !== user.userEmodeCategoryId) return false;
  if (user?.isInIsolationMode && !borrowableInIsolation) return false;
  return true;
}
