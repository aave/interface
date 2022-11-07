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
  // Available borrows is min of user avaiable borrows and remaining facilitator capacity
  const remainingBucketCapacity = ghoFacilitatorCapacity - ghoFacilitatorLevel;

  const availableBorrows = Math.min(userAvailableBorrows, remainingBucketCapacity);

  return availableBorrows;
};
