import {
  AaveV3Arbitrum,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BNB,
  AaveV3Celo,
  AaveV3Ethereum,
  AaveV3EthereumEtherFi,
  AaveV3EthereumLido,
  AaveV3Gnosis,
  AaveV3Linea,
  AaveV3Metis,
  AaveV3Optimism,
  AaveV3Polygon,
  AaveV3Scroll,
  AaveV3Soneium,
  AaveV3Sonic,
  AaveV3ZkSync,
} from '@bgd-labs/aave-address-book';
import { Address } from 'abitype';
import { checksumAddress } from 'viem';

const allAaveAssets = [
  AaveV3Ethereum.ASSETS,
  AaveV3EthereumLido.ASSETS,
  AaveV3EthereumEtherFi.ASSETS,
  AaveV3Base.ASSETS,
  AaveV3Arbitrum.ASSETS,
  AaveV3Avalanche.ASSETS,
  AaveV3Sonic.ASSETS,
  AaveV3Optimism.ASSETS,
  AaveV3Polygon.ASSETS,
  AaveV3Metis.ASSETS,
  AaveV3Gnosis.ASSETS,
  AaveV3BNB.ASSETS,
  AaveV3Scroll.ASSETS,
  AaveV3Linea.ASSETS,
  AaveV3Celo.ASSETS,
  AaveV3Soneium.ASSETS,
  AaveV3ZkSync.ASSETS,
];

const getUnderlyingAndAToken = (assets: {
  [key: string]: {
    UNDERLYING: Address;
    A_TOKEN: Address;
  };
}) => {
  return Object.entries(assets).flatMap(([, asset]) => [asset.UNDERLYING, asset.A_TOKEN]);
};

const otherTokensWhitelisted = [
  '0x04eadd7b10ea9a484c60860aea7a7c0aec09b9f0', // aUSDtb wrapper contract
  '0x3a4de44b29995a3d8cd02d46243e1563e55bcc8b', // Aave Ethereum USDe (wrapped)
  '0xdcc1bcc6ecd1e63cba178c289bc1da9f757a2ef4', // Aave Linea weETH (wrapper)
  '0x503D751B13a71D8e69Db021DF110bfa7aE1dA889', // Aave Horizon RWA RLUSD (wrapped)
  '0x0AD8ac496B4280bC3B36fb1b6372abdEc8eE7C54', // Aave Horizon RWA USDC (wrapped)
  '0xb8021254f00C1aFb67b861f274cea175FB97c2Af', // aSCR Scroll (wrapper)
  '0x2c63f9da936624Ac7313b972251D340260A4bF08', // aARB Arbitrum (wrapper)
].map((address) => checksumAddress(address as Address));

export const whitelistedRewardTokens = new Set([
  ...allAaveAssets.flatMap((assets) => getUnderlyingAndAToken(assets)),
  ...otherTokensWhitelisted,
]);
