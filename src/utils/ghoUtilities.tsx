import { GhoReserveData, GhoUserData, normalize } from '@aave/math-utils';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export const GHO_SYMBOL = 'GHO';

/**
 * List of markets where new GHO minting is available.
 * Note that his is different from markets where GHO is listed as a reserve.
 */
export const GHO_MINTING_MARKETS = [
  'proto_mainnet_v3',
  'fork_proto_mainnet_v3',
  'proto_sepolia_v3',
  'fork_proto_sepolia_v3',
];

export const getGhoReserve = (reserves: ComputedReserveData[]) => {
  return reserves.find((reserve) => reserve.symbol === GHO_SYMBOL);
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

interface ReserveWithSymbol {
  symbol: string;
}

type FindAndFilterReturn<T> = {
  value: T | undefined;
  filtered: Array<T>;
};

export const findAndFilterMintableGhoReserve = <T extends ReserveWithSymbol>(
  reserves: Array<T>,
  currentMarket: string
) => {
  if (!GHO_MINTING_MARKETS.includes(currentMarket)) return { value: undefined, filtered: reserves };

  return reserves.reduce<FindAndFilterReturn<T>>(
    (acum, reserve) => {
      if (reserve.symbol === GHO_SYMBOL) return { value: reserve, filtered: acum.filtered };
      else return { ...acum, filtered: acum.filtered.concat(reserve) };
    },
    {
      value: undefined,
      filtered: [],
    }
  );
};

/**
 * Determines if the given symbol is GHO and the market supports minting new GHO
 */
export const displayGhoForMintableMarket = ({
  symbol,
  currentMarket,
}: GhoUtilMintingAvailableParams): boolean => {
  return symbol === GHO_SYMBOL && GHO_MINTING_MARKETS.includes(currentMarket);
};

interface GhoUtilMintingAvailableParams {
  symbol: string;
  currentMarket: string;
}

export const ghoUserQualifiesForDiscount = (
  ghoReserveData: GhoReserveData,
  ghoUserData: GhoUserData,
  futureBorrowAmount = '0'
) => {
  const borrowBalance = Number(normalize(ghoUserData.userGhoScaledBorrowBalance, 18));
  const minBorrowBalanceForDiscount = Number(
    normalize(ghoReserveData.ghoMinDebtTokenBalanceForDiscount, 18)
  );

  const stkAaveBalance = Number(normalize(ghoUserData.userDiscountTokenBalance, 18));
  const minStkAaveBalanceForDiscount = Number(
    normalize(ghoReserveData.ghoMinDiscountTokenBalanceForDiscount, 18)
  );

  return (
    borrowBalance + Number(futureBorrowAmount) >= minBorrowBalanceForDiscount &&
    stkAaveBalance >= minStkAaveBalanceForDiscount
  );
};
