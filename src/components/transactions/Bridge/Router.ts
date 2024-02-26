// Note taken from
// https://github.com/smartcontractkit/smart-contract-examples/blob/main/ccip-offchain/javascript/src/config/router.js
import { ChainId } from '@aave/contract-helpers';

const supportedNetworks = [
  'ethereumSepolia',
  'optimismGoerli',
  'avalancheFuji',
  'polygonMumbai',
  'bnbTestnet',
  'baseGoerli',
];

const ethereumSepolia = {
  address: '0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59',
  chainSelector: '16015286601757825753',
  //   chainSelector: '3478487238524512106',
};

const optimismGoerli = {
  address: '0xcc5a0b910d9e9504a7561934bed294c51285a78d',
  chainSelector: '2664363617261496610',
};

const avalancheFuji = {
  address: '0xf694e193200268f9a4868e4aa017a0118c9a8177',
  chainSelector: '14767482510784806043',
};

const polygonMumbai = {
  address: '0x1035cabc275068e0f4b745a29cedf38e13af41b1',
  chainSelector: '12532609583862916517',
};

const bnbTestnet = {
  address: '0xe1053ae1857476f36a3c62580ff9b016e8ee8f6f',
  chainSelector: '13264668187771770619',
};

const baseGoerli = {
  address: '0x80af2f44ed0469018922c9f483dc5a909862fdc2',
  chainSelector: '5790810961207155433',
};

const arbitrumTestnet = {
  address: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
  chainSelector: '3478487238524512106',
};

// export enum ChainId {
//   mainnet = 1,
//   ropsten = 3,
//   rinkeby = 4,
//   goerli = 5,
//   kovan = 42,
//   xdai = 100,
//   polygon = 137,
//   mumbai = 80001,
//   avalanche = 43114,
//   fuji = 43113, // avalanche test network
//   arbitrum_one = 42161,
//   arbitrum_rinkeby = 421611,
//   arbitrum_goerli = 421613,
//   fantom = 250,
//   fantom_testnet = 4002,
//   optimism = 10,
//   optimism_kovan = 69,
//   optimism_goerli = 420,
//   harmony = 1666600000,
//   harmony_testnet = 1666700000,
//   zkevm_testnet = 1402,
//   sepolia = 11155111,
//   scroll_sepolia = 534351,
//   scroll = 534352,
//   metis_andromeda = 1088,
//   base = 8453,
//   bnb = 56,
// }

const getRouterConfig = (network: number) => {
  switch (network) {
    case ChainId.sepolia:
      return ethereumSepolia;
    case ChainId.optimism_goerli:
      return optimismGoerli;
    case 421614:
      return arbitrumTestnet;
    case ChainId.fuji:
      return avalancheFuji;
    case ChainId.mumbai:
      return polygonMumbai;
    // case 'bnbTestnet':
    //   return bnbTestnet;
    // case 'baseGoerli':
    //   return baseGoerli;
    default:
      throw new Error('Unknown network: ' + network);
  }
};

module.exports = {
  getRouterConfig,
  supportedNetworks,
};
