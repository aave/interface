import { TokenRequest } from '../../../support/actions/tenderly.actions';

export interface DonorInfo {
  name: string;
  donorWalletAddress: string;
  tokenAddress: string;
}

export interface Donors {
  [key: string]: DonorInfo;
}

const donors: Donors = {
  stkAAVE: {
    name: 'stkAAVE',
    donorWalletAddress: '0xaFDAbFb6227507fF6522b8a242168F6b5F353a6E',
    tokenAddress: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
  },
  aAAVE: {
    name: 'aAAVE',
    donorWalletAddress: '0xE466d6Cf6E2C3F3f8345d39633d4A968EC879bD5',
    tokenAddress: '0xFFC97d72E13E01096502Cb8Eb52dEe56f74DAD7B',
  },
  aDAIEthereumV3: {
    name: 'aDAI',
    donorWalletAddress: '0x018008bfb33d285247A21d44E50697654f754e63',
    tokenAddress: '0xaD0135AF20fa82E106607257143d0060A7eB5cBf',
  },
  aETHEthereumV3: {
    name: 'aETH',
    donorWalletAddress: '0x01d1f55d94a53a9517c07f793f35320FAA0D2DCf',
    tokenAddress: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
  },
  aETHArbitrumV3: {
    name: 'aETH',
    donorWalletAddress: '0xb7fb2b774eb5e2dad9c060fb367acbdc7fa7099b',
    tokenAddress: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
  },
  aAVAXAvalancheV3: {
    name: 'aAVAX',
    donorWalletAddress: '0xAe783a7C8C607EFe00548A0592BF9cDb50903B79',
    tokenAddress: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
  },
  aMATICPolygonV3: {
    name: 'aMATIC',
    donorWalletAddress: '0x1e5b92c66e4CAd7963E8dAcF1E8D642304C172C8',
    tokenAddress: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
  },
  aETHOptimismV3: {
    name: 'aETH',
    donorWalletAddress: '0x39Be632bfC5A74183FfE124C60e248138e496BC4',
    tokenAddress: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
  },
  aETHBaseV3: {
    name: 'aETH',
    donorWalletAddress: '0xb463c4d7c574bd0a05a1320186378dd6a7aeaa33',
    tokenAddress: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7',
  },
  axDAIGnosisV3: {
    name: 'axDAI',
    donorWalletAddress: '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f',
    tokenAddress: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533',
  },
  aBNBBnbV3: {
    name: 'aBNB',
    donorWalletAddress: '0x2F064D92e862F30041DEA4667eF8899E07Bb4Edf',
    tokenAddress: '0x9B00a09492a626678E5A3009982191586C444Df9',
  },
  aETHEthereumV2: {
    name: 'aETH',
    donorWalletAddress: '0x1111567E0954E74f6bA7c4732D534e75B81DC42E',
    tokenAddress: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
  },
  aMATICPolygonV2: {
    name: 'aMATIC',
    donorWalletAddress: '0x7068Ea5255cb05931EFa8026Bd04b18F3DeB8b0B',
    tokenAddress: '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4',
  },
  aAVAXAvalancheV2: {
    name: 'aAVAX',
    donorWalletAddress: '0xe5dbFF893E6120C0d013FB046cd755990E4BE9a9',
    tokenAddress: '0xDFE521292EcE2A4f44242efBcD66Bc594CA9714B',
  },
};

export type RequestedTokens = {
  [key: string]: number;
};

export const tokenSet = (requestedTokens: RequestedTokens): TokenRequest[] => {
  const tokenRequest: TokenRequest[] = [];

  for (const [tokenKey, tokenAmount] of Object.entries(requestedTokens)) {
    const donorInfo = donors[tokenKey];
    if (tokenAmount !== 0 && donorInfo) {
      tokenRequest.push({
        tokenAddress: donorInfo.tokenAddress,
        donorAddress: donorInfo.donorWalletAddress,
        tokenCount: tokenAmount.toString(),
        name: donorInfo.name,
      });
    }
  }

  return tokenRequest;
};
