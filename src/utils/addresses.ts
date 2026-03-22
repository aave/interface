import {
  addresses_arbitrum_sepolia,
  addresses_mainnet,

} from 'src/const';

export const addressesByChainId = (chainId: number) => {
  switch (chainId) {
    case 421614:
      return addresses_arbitrum_sepolia;
    case 56:
      return addresses_mainnet;
    default:
      return addresses_mainnet;
  }
};
