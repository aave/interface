import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export const GHO_SYMBOL = 'GHO';

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
 * Determines if the provided asset is GHO and is available to borrow on a given market. It takes in symbol as a param due that this can be run within a loop over all assets to determine whether to display GHO-related components in the UI.
 * @param {string} symbol - The asset symbol, ie GHO, AAVE, etc.
 * @param {string} currentMarket - The market name to check against
 * @returns {boolean} - If the provided asset is GHO and also if the market passed in supports GHO.
 */
export const isGhoAndSupported = ({
  symbol,
  currentMarket,
}: GhoUtilMintingAvailableParams): boolean => {
  return symbol === GHO_SYMBOL && GHO_SUPPORTED_MARKETS.includes(currentMarket);
};

export const getGhoReserve = (reserves: ComputedReserveData[]) => {
  return reserves.find((reserve) => reserve.symbol === GHO_SYMBOL);
};

/**
 * Returns the minimum of user available borrows and remaining facilitator capacity
 * @param userAvailableBorrows The max amount a user can borrow with their current collateral
 * @param ghoFacilitatorCapacity The max amount the GHO facilitator can mint
 * @param ghoFacilitatorLevel The current amount minted by the GHO facilitator
 * @returns
 */
export const getAvailableBorrows = (
  userAvailableBorrows: number,
  ghoFacilitatorCapacity: number,
  ghoFacilitatorLevel: number
): number => {
  const remainingBucketCapacity = ghoFacilitatorCapacity - ghoFacilitatorLevel;
  return Math.min(userAvailableBorrows, remainingBucketCapacity);
};

/**
 * Calculates the weighted average APY
 * @param baseVariableBorrowRate - The base variable borrow rate, normalized
 * @param totalBorrowAmount - The total amount of the asset that is being borrowed
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
  if (discountableAmount === 0) return baseVariableBorrowRate;
  if (totalBorrowAmount <= discountableAmount) return borrowRateAfterDiscount;

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
