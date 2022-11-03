export const ghoMintingAvailable = ({
  symbol,
  currentMarket,
}: {
  symbol: string;
  currentMarket: string;
}): boolean => {
  const ghoMintingMarkets = [
    'proto_goerli_gho_v3',
    'fork_proto_goerli_gho_v3',
    'proto_mainnet_v3',
    'fork_proto_mainnet_v3',
  ];
  if (symbol === 'GHO' && ghoMintingMarkets.includes(currentMarket)) {
    return true;
  } else {
    return false;
  }
};
