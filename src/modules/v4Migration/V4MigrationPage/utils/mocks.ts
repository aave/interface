import { BorrowMigrationPosition, EarnMigrationPosition, MigrationAsset } from './types';

const USDC: MigrationAsset = {
  symbol: 'USDC',
  name: 'USD Coin',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
};
const USDT: MigrationAsset = {
  symbol: 'USDT',
  name: 'Tether USD',
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
};
const WETH: MigrationAsset = {
  symbol: 'WETH',
  name: 'Wrapped Ether',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
};
const WBTC: MigrationAsset = {
  symbol: 'WBTC',
  name: 'Wrapped BTC',
  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
};
const AVAX: MigrationAsset = {
  symbol: 'AVAX',
  name: 'Avalanche',
  address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
};
const BTCB: MigrationAsset = {
  symbol: 'BTC.b',
  name: 'Bitcoin',
  address: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
};
const GHO: MigrationAsset = {
  symbol: 'GHO',
  name: 'Gho Token',
  address: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
};
const AVALANCHE_USDC: MigrationAsset = {
  ...USDC,
  address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
};
const WEETH: MigrationAsset = {
  symbol: 'weETH',
  name: 'Wrapped eETH',
  address: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
};
const BASE_WETH: MigrationAsset = {
  ...WETH,
  address: '0x4200000000000000000000000000000000000006',
};

export const EARN_POSITIONS: EarnMigrationPosition[] = [
  {
    id: 'earn-ethereum-usdc',
    asset: USDC,
    marketName: 'Main',
    supplied: { amount: '425.5', usd: '425.5' },
    supplyApy: { current: 0.0384, after: 0.0426 },
    projectedEarningsUSD: { current: 100, after: 200 },
  },
  {
    id: 'earn-avalanche-avax',
    asset: AVAX,
    marketName: 'Core',
    supplied: { amount: '8.25', usd: '198' },
    supplyApy: { current: 0.0162, after: 0.0214 },
    projectedEarningsUSD: { current: 3.21, after: 4.24 },
  },
  {
    id: 'earn-ethereum-usdt',
    asset: USDT,
    marketName: 'Core',
    supplied: { amount: '180.75', usd: '180.75' },
    supplyApy: { current: 0.0357, after: 0.0403 },
    projectedEarningsUSD: { current: 6.45, after: 7.28 },
  },
];

export const BORROW_POSITIONS: BorrowMigrationPosition[] = [
  {
    id: 'borrow-ethereum-prime',
    chainId: 1,
    marketName: 'Prime',
    netBalanceUSD: 6120,
    collateral: [WETH, WBTC],
    collateralUSD: 9800,
    borrowed: [USDT],
    borrowedUSD: 3680,
    borrowApy: { current: 0.0125, after: 0.0041 },
    healthFactor: { current: '4.45', after: '12.23' },
  },
  {
    id: 'borrow-avalanche-core',
    chainId: 43114,
    marketName: 'Core',
    netBalanceUSD: 3120,
    collateral: [BTCB],
    collateralUSD: 5200,
    borrowed: [GHO, AVALANCHE_USDC],
    borrowedUSD: 2080,
    borrowApy: { current: 0.0412, after: 0.0348 },
    healthFactor: { current: '4.45', after: '6.23' },
  },
  {
    id: 'borrow-base-core',
    chainId: 8453,
    marketName: 'Core',
    netBalanceUSD: 20120,
    collateral: [WEETH],
    collateralUSD: 98000,
    borrowed: [BASE_WETH],
    borrowedUSD: 77880,
    healthFactor: { current: '1.25', after: '1.23' },
  },
];
