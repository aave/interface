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

export const ghoBorrowAPRWithMaxDiscount = (ghoDiscountRate: number, variableBorrowAPR: string) => {
  return Number(variableBorrowAPR) * (1 - ghoDiscountRate);
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
 * Formats the GHO discount lock period from uint256 to a human-readable date
 * @param discountLockPeriod - The BigNumber of the discount lock period returned from the GhoVariableDebtToken.sol contract
 * @returns - A formatted date as a string
 */
export const formatGhoDiscountLockPeriod = (discountLockPeriod: BigNumber): string => {
  const date = new Date(discountLockPeriod.toNumber());
  const formatter = timeFormat('%d %B %Y');
  return formatter(date);
};
