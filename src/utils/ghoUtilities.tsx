import { timeFormat } from 'd3-time-format';
import { BigNumber } from 'ethers';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

/**
 * Determines if GHO is available for borrowing (minting) on the provided network, also based off the token symbol being borrowed
 * @param {GhoUtilMintingAvailableParams} - The reserve symbol and current market name
 * @returns {bool} - If the GHO token is available for minting
 */
type GhoUtilMintingAvailableParams = {
  symbol: string;
  currentMarket: string;
};

export const GHO_SUPPORTED_MARKETS = [
  'proto_goerli_gho_v3',
  'fork_proto_goerli_gho_v3',
  'proto_mainnet_v3',
  'fork_proto_mainnet_v3',
];

/**
 * Determines if GHO is available for minting on a given network. It takes in symbol as a param due that this can be run within a loop over all assets.
 * @param symbol - The asset symbol, ie GHO
 * @returns {boolean} - If minting GHO is available on the current network
 */
export const ghoMintingAvailable = ({
  symbol,
  currentMarket,
}: GhoUtilMintingAvailableParams): boolean => {
  if (symbol === 'GHO' && GHO_SUPPORTED_MARKETS.includes(currentMarket)) {
    return true;
  } else {
    return false;
  }
};

export const getGhoReserve = (reserves: ComputedReserveData[]) => {
  return reserves.find((reserve) => reserve.symbol === 'GHO');
};

export const getAvailableBorrows = (
  userAvailableBorrows: number,
  ghoFacilitatorCapacity: number,
  ghoFacilitatorLevel: number
): number => {
  // Available borrows is min of user available borrows and remaining facilitator capacity
  const remainingBucketCapacity = ghoFacilitatorCapacity - ghoFacilitatorLevel;

  const availableBorrows = Math.min(userAvailableBorrows, remainingBucketCapacity);

  return availableBorrows;
};

/**
 * Formats the expiry for a provided date tied with the GHO discount lock period in a human-readable way
 * @param discountLockPeriod - The BigNumber of the discount lock period returned from the GhoVariableDebtToken.sol contract
 * @returns - A formatted date as a string representing when the lock period will expiry for the given date
 */
export const formatGhoDiscountLockPeriodExpiryDate = (
  timeOfBorrow: Date,
  discountLockPeriod: BigNumber
): string => {
  const periodInMilliseconds = discountLockPeriod.toNumber();
  const periodInDays = periodInMilliseconds / 86400;
  // Calculate the date of the time passed in + the expiry in days
  const lockPeriodExpiryDate = new Date(
    timeOfBorrow.setDate(timeOfBorrow.getDate() + periodInDays)
  );
  const formatter = timeFormat('%d %B %Y');
  return formatter(lockPeriodExpiryDate);
};

// Not gho specific, but we should look at doing this logic in math-helpers
export const normalizeBaseVariableBorrowRate = (baseVariableBorrowRate: string | number) => {
  return Number(baseVariableBorrowRate) / 10 ** 27;
};

/**
 * Calculates the weighted average APY
 * @param baseVariableBorrowRate - The base variable borrow rate, normalized
 * @param totalBorrowAmount - The total amount of the asset that is borrowed
 * @param discountableAmount - The amount that can be discounted for the user
 * @param borrowRateAfterDiscount - The borrow rate after the discount is applied
 * @returns
 */
export const weightedAverageAPY = (
  baseVariableBorrowRate: number,
  totalBorrowAmount: number,
  discountableAmount: number,
  borrowRateAfterDiscount: number
) => {
  if (totalBorrowAmount <= discountableAmount) {
    return borrowRateAfterDiscount;
  }

  const nonDiscountableAmount = totalBorrowAmount - discountableAmount;
  return (
    (nonDiscountableAmount * baseVariableBorrowRate +
      discountableAmount * borrowRateAfterDiscount) /
    totalBorrowAmount
  );
};

/**
 * This helps display the discountable amount of GHO based off of how much is being borrowed and how much is discountable.
 * This is used in both the borrow modal and the discount rate calculator.
 * @param discountableGhoAmount - The amount of GHO that is discountable
 * @param amountGhoBeingBorrowed - The amount of GHO requesting to be borrowed
 * @returns The amount of discountable GHO as a number in a display-friendly form
 */
export const displayDiscountableAmount = (
  discountableGhoAmount: number,
  amountGhoBeingBorrowed: number
): number => {
  return discountableGhoAmount >= amountGhoBeingBorrowed
    ? amountGhoBeingBorrowed
    : discountableGhoAmount;
};

/**
 * This helps display the non-discountable amount of GHO based off of how much is being borrowed and how much is discountable.
 * This is used in both the borrow modal and the discount rate calculator.
 * @param discountableGhoAmount - The amount of GHO that is discountable
 * @param amountGhoBeingBorrowed - The amount of GHO requesting to be borrowed
 * @returns The amount of non-discountable GHO as a number in a display-friendly form
 */
export const displayNonDiscountableAmount = (
  discountableGhoAmount: number,
  amountGhoBeingBorrowed: number
): number => {
  return discountableGhoAmount >= amountGhoBeingBorrowed
    ? 0
    : amountGhoBeingBorrowed - discountableGhoAmount;
};
