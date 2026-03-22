import {
  addresses_arbitrum_sepolia,
  addresses_mainnet,
  addresses_testnet,
} from 'src/const';

export const addressesByChainId = (chainId: number) => {
  switch (chainId) {
    case 421614:
      return addresses_arbitrum_sepolia;
    case 56:
      return addresses_mainnet;
    case 97:
      return addresses_testnet;
    default:
      return addresses_mainnet;
  }
};
