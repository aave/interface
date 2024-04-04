// Note taken from
// https://github.com/smartcontractkit/smart-contract-examples/blob/main/ccip-offchain/javascript/src/config/router.js
import { ChainId } from '@aave/contract-helpers';

const ethMainnet = {
  address: '0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D',
  chainSelector: '5009297550715157269',
};

const ethereumSepolia = {
  address: '0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59',
  chainSelector: '16015286601757825753',
  //   chainSelector: '3478487238524512106',
};

// const optimismGoerli = {
//   address: '0xcc5a0b910d9e9504a7561934bed294c51285a78d',
//   chainSelector: '2664363617261496610',
// };

const avalancheFuji = {
  address: '0xf694e193200268f9a4868e4aa017a0118c9a8177',
  chainSelector: '14767482510784806043',
};

const polygonMumbai = {
  address: '0x1035cabc275068e0f4b745a29cedf38e13af41b1',
  chainSelector: '12532609583862916517',
};

// const bnbTestnet = {
//   address: '0xe1053ae1857476f36a3c62580ff9b016e8ee8f6f',
//   chainSelector: '13264668187771770619',
// };

// const baseGoerli = {
//   address: '0x80af2f44ed0469018922c9f483dc5a909862fdc2',
//   chainSelector: '5790810961207155433',
// };

const baseSepolia = {
  address: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93',
  chainSelector: '10344971235874465080',
};

const arbitrumTestnet = {
  address: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
  chainSelector: '3478487238524512106',
};

export const getRouterConfig = (network: number) => {
  switch (network) {
    case ChainId.sepolia:
      return ethereumSepolia;
    // case ChainId.optimism_goerli:
    //   return optimismGoerli;
    case 421614:
      return arbitrumTestnet;
    case ChainId.fuji:
      return avalancheFuji;
    case ChainId.mumbai:
      return polygonMumbai;
    case ChainId.mainnet:
      return ethMainnet;
    case ChainId.base_sepolia:
      return baseSepolia;
    default:
      throw new Error('Unknown network: ' + network);
  }
};
