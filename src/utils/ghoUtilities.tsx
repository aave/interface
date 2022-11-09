import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export const ghoMintingMarkets = [
  'proto_goerli_gho_v3',
  'fork_proto_goerli_gho_v3',
  'proto_mainnet_v3',
  'fork_proto_mainnet_v3',
];

export const ghoMintingAvailable = ({
  symbol,
  currentMarket,
}: {
  symbol: string;
  currentMarket: string;
}): boolean => {
  if (symbol === 'GHO' && ghoMintingMarkets.includes(currentMarket)) {
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
  // Available borrows is min of user avaiable borrows and remaining facilitator capacity
  const remainingBucketCapacity = ghoFacilitatorCapacity - ghoFacilitatorLevel;

  const availableBorrows = Math.min(userAvailableBorrows, remainingBucketCapacity);

  return availableBorrows;
};

/**
 * Amount of GHO that can be borrowed at a discounted rate given a users stkAave balance
 */
export const ghoDiscountableAmount = (
  stakedAaveBalance: BigNumberish,
  ghoDiscountedPerToken: string
) => {
  return Number(formatUnits(stakedAaveBalance, 18)) * Number(ghoDiscountedPerToken);
};

// Not gho specific, but we should look at doing this logic in math-helpers
export const normalizeBaseVariableBorrowRate = (baseVariableBorrowRate: string | number) => {
  return Number(baseVariableBorrowRate) / 10 ** 27;
};
