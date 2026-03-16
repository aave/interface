import { TokenRequest } from '../actions/tenderly.actions';

export interface DonorInfo {
  name: string;
  tokenAddress: string;
  // For aTokens: pool address and underlying asset needed to enable collateral
  poolAddress?: string;
  underlyingAsset?: string;
}

export interface Donors {
  [key: string]: DonorInfo;
}

const donors: Donors = {
  stkAAVE: {
    name: 'stkAAVE',
    tokenAddress: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
  },
  aAAVE: {
    name: 'aAAVE',
    tokenAddress: '0xFFC97d72E13E01096502Cb8Eb52dEe56f74DAD7B',
  },
  aDAIEthereumV3: {
    name: 'aDAI',
    tokenAddress: '0xaD0135AF20fa82E106607257143d0060A7eB5cBf',
  },
  aETHEthereumV3: {
    name: 'aETH',
    tokenAddress: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
    poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    underlyingAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  },
  aETHArbitrumV3: {
    name: 'aETH',
    tokenAddress: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    underlyingAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
  },
  aAVAXAvalancheV3: {
    name: 'aAVAX',
    tokenAddress: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    underlyingAsset: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
  },
  aMATICPolygonV3: {
    name: 'aMATIC',
    tokenAddress: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    underlyingAsset: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WPOL
  },
  aETHOptimismV3: {
    name: 'aETH',
    tokenAddress: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    underlyingAsset: '0x4200000000000000000000000000000000000006', // WETH
  },
  aETHBaseV3: {
    name: 'aETH',
    tokenAddress: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7',
    poolAddress: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    underlyingAsset: '0x4200000000000000000000000000000000000006', // WETH
  },
  axDAIGnosisV3: {
    name: 'axDAI',
    tokenAddress: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533',
    poolAddress: '0xb50201558B00496A145fE76f7424749556E326D8',
    underlyingAsset: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // WXDAI
  },
  aBNBBnbV3: {
    name: 'aBNB',
    tokenAddress: '0x9B00a09492a626678E5A3009982191586C444Df9',
    poolAddress: '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
    underlyingAsset: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
  },
  aETHEthereumV2: {
    name: 'aETH',
    tokenAddress: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
  },
  aMATICPolygonV2: {
    name: 'aMATIC',
    tokenAddress: '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4',
  },
  aAVAXAvalancheV2: {
    name: 'aAVAX',
    tokenAddress: '0xDFE521292EcE2A4f44242efBcD66Bc594CA9714B',
  },
};

export type RequestedTokens = {
  [key: string]: number;
};

export const tokenSet = (requestedTokens: RequestedTokens, autoSupply = true): TokenRequest[] => {
  const tokenRequest: TokenRequest[] = [];

  for (const [tokenKey, tokenAmount] of Object.entries(requestedTokens)) {
    const donorInfo = donors[tokenKey];
    if (tokenAmount !== 0 && donorInfo) {
      tokenRequest.push({
        tokenAddress: donorInfo.tokenAddress,
        tokenCount: tokenAmount.toString(),
        name: donorInfo.name,
        poolAddress: donorInfo.poolAddress,
        underlyingAsset: donorInfo.underlyingAsset,
        autoSupply: donorInfo.underlyingAsset != null ? autoSupply : undefined,
      });
    }
  }

  return tokenRequest;
};
