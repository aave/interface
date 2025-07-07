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
