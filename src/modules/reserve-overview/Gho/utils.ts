import { calculateCompoundedRate, RAY_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { weightedAverageAPY } from 'src/utils/ghoUtilities';

import { ESupportedTimeRanges } from '../TimeRangeSelector';

dayjs.extend(duration);

/**
 * This function recreates the logic that happens in GhoDiscountRateStrategy.sol to determine a user's discount rate for borrowing GHO based off of the amount of stkAAVE a user holds and a given term length
 * This is repeated here so that we don't bombard the RPC with HTTP requests to do this calculation and read from on-chain logic.
 * NOTE: if the discount rate strategy changes on-chain, then this creates a maintenance issue and we'll have to update this.
 * @param borrowedGho - The hypothetical amount of GHO
 * @param termDuration - The length of the borrow
 * @param discountableAmount - The amount of GHO that can be discounted based on how much stkAave the user has
 * @param ghoBaseVariableBorrowRate - The base variable borrow rate for GHO
 * @param ghoDiscountRate - The discount rate for GHO
 */
export const calculateDiscountRate = (
  borrowedGho: number,
  termDuration: number,
  discountableAmount: number,
  ghoBaseVariableBorrowRate: number,
  ghoDiscountRate: number
) => {
  const ratePayload = {
    rate: valueToBigNumber(ghoBaseVariableBorrowRate).shiftedBy(RAY_DECIMALS),
    duration: termDuration,
  };
  const newRate = calculateCompoundedRate(ratePayload).shiftedBy(-RAY_DECIMALS).toNumber();
  const borrowRateWithMaxDiscount = newRate * (1 - ghoDiscountRate);
  // Apply discount to the newly compounded rate
  const newBorrowRate = weightedAverageAPY(
    newRate,
    borrowedGho,
    discountableAmount,
    borrowRateWithMaxDiscount
  );

  return {
    baseRate: newRate,
    rateAfterDiscount: newBorrowRate,
    rateAfterMaxDiscount: borrowRateWithMaxDiscount,
  };
};

export const getSecondsForGhoBorrowTermDuration = (timeRange: ESupportedTimeRanges): number => {
  switch (timeRange) {
    case ESupportedTimeRanges.OneMonth:
      return dayjs.duration({ days: 31 }).asSeconds();
    case ESupportedTimeRanges.ThreeMonths:
      return dayjs.duration({ years: 0.25 }).asSeconds();
    case ESupportedTimeRanges.SixMonths:
      return dayjs.duration({ years: 0.5 }).asSeconds();
    case ESupportedTimeRanges.OneYear:
      return dayjs.duration({ years: 1 }).asSeconds();
    case ESupportedTimeRanges.TwoYears:
      return dayjs.duration({ years: 2 }).asSeconds();
    case ESupportedTimeRanges.FiveYears:
      return dayjs.duration({ years: 5 }).asSeconds();
    default:
      // Return today as a fallback
      return dayjs.duration({ days: 1 }).asSeconds();
  }
};
