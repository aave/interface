export type ChartRange = '1w' | '1m' | '6m';

export type EmodeRow = { label: string; value: string };

export type EmodeCategory = {
  title: string;
  collateral: 'yes' | 'no';
  borrowable: 'yes' | 'no';
  rows: EmodeRow[];
};

export type MarketAssetDetailsMock = {
  asset: string;
  name: string;
  icon: string;
  reserveSize: string;
  reserveSizeUsd: string;
  availableLiquidity: string;
  availableLiquidityUsd: string;
  utilizationRate: string;
  oraclePrice: string;
  oraclePriceUsd: string;
  supply: {
    utilizationPct: number;
    totalSupplied: string;
    totalSuppliedCap: string;
    totalSuppliedUsd: string;
    totalSuppliedCapUsd: string;
    apy: string;
    chartAvg: string;
  };
  borrow: {
    utilizationPct: number;
    totalBorrowed: string;
    totalBorrowedCap: string;
    totalBorrowedUsd: string;
    totalBorrowedCapUsd: string;
    apyVariable: string;
    borrowCap: string;
    borrowCapUsd: string;
    chartAvg: string;
  };
  collateral: {
    maxLtv: string;
    liquidationThreshold: string;
    liquidationPenalty: string;
  };
  collector: {
    reserveFactor: string;
    contractUrl: string;
  };
  emode: EmodeCategory[];
};

export const MARKET_ASSET_DETAILS_BY_UNDERLYING: Record<string, MarketAssetDetailsMock> = {
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
    asset: 'WETH',
    name: 'Wrapped Ether',
    icon: '/icons/tokens/eth.svg',
    reserveSize: '6.06B',
    reserveSizeUsd: '6.06B',
    availableLiquidity: '400.19M',
    availableLiquidityUsd: '400.19M',
    utilizationRate: '93.40%',
    oraclePrice: '2,061.87',
    oraclePriceUsd: '2,061.87',
    supply: {
      utilizationPct: 85.79,
      totalSupplied: '2.94M',
      totalSuppliedCap: '3.80M',
      totalSuppliedUsd: '$6.06B',
      totalSuppliedCapUsd: '$7.84B',
      apy: '1.95%',
      chartAvg: 'Avg 1.28%',
    },
    borrow: {
      utilizationPct: 76.02,
      totalBorrowed: '2.94M',
      totalBorrowedCap: '3.80M',
      totalBorrowedUsd: '$6.06B',
      totalBorrowedCapUsd: '$7.84B',
      apyVariable: '1.95%',
      borrowCap: '3.60M',
      borrowCapUsd: '$6.06B',
      chartAvg: 'Avg 1.28%',
    },
    collateral: {
      maxLtv: '80.50%',
      liquidationThreshold: '80.50%',
      liquidationPenalty: '5.00%',
    },
    collector: {
      reserveFactor: '15.00%',
      contractUrl: 'https://etherscan.io',
    },
    emode: [
      {
        title: 'ETH correlated',
        collateral: 'yes',
        borrowable: 'yes',
        rows: [
          { label: 'Max LTV', value: '80.50%' },
          { label: 'Liquidation threshold', value: '82.10%' },
          { label: 'Liquidation penalty', value: '2.50%' },
        ],
      },
      {
        title: 'rsETH__ETH_wstETH_ETHx',
        collateral: 'no',
        borrowable: 'yes',
        rows: [
          { label: 'Max LTV', value: '72.00%' },
          { label: 'Liquidation threshold', value: '75.00%' },
          { label: 'Liquidation penalty', value: '3.00%' },
        ],
      },
    ],
  },
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
    asset: 'USDC',
    name: 'USD Coin',
    icon: '/icons/tokens/usdbc.svg',
    reserveSize: '7.55B',
    reserveSizeUsd: '7.55B',
    availableLiquidity: '1.20B',
    availableLiquidityUsd: '1.20B',
    utilizationRate: '84.10%',
    oraclePrice: '1.00',
    oraclePriceUsd: '1.00',
    supply: {
      utilizationPct: 78.2,
      totalSupplied: '3.82M',
      totalSuppliedCap: '5.00M',
      totalSuppliedUsd: '$7.55B',
      totalSuppliedCapUsd: '$9.90B',
      apy: '2.51%',
      chartAvg: 'Avg 2.12%',
    },
    borrow: {
      utilizationPct: 71.5,
      totalBorrowed: '2.74M',
      totalBorrowedCap: '4.20M',
      totalBorrowedUsd: '$5.40B',
      totalBorrowedCapUsd: '$8.30B',
      apyVariable: '4.92%',
      borrowCap: '4.00M',
      borrowCapUsd: '$7.90B',
      chartAvg: 'Avg 4.05%',
    },
    collateral: {
      maxLtv: '75.00%',
      liquidationThreshold: '78.50%',
      liquidationPenalty: '4.50%',
    },
    collector: {
      reserveFactor: '10.00%',
      contractUrl: 'https://etherscan.io',
    },
    emode: [
      {
        title: 'Stablecoins',
        collateral: 'yes',
        borrowable: 'yes',
        rows: [
          { label: 'Max LTV', value: '93.00%' },
          { label: 'Liquidation threshold', value: '95.00%' },
          { label: 'Liquidation penalty', value: '1.00%' },
        ],
      },
    ],
  },
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': {
    asset: 'USDT',
    name: 'Tether USD',
    icon: '/icons/tokens/usdt.svg',
    reserveSize: '2.88B',
    reserveSizeUsd: '2.88B',
    availableLiquidity: '410M',
    availableLiquidityUsd: '410M',
    utilizationRate: '85.70%',
    oraclePrice: '1.00',
    oraclePriceUsd: '1.00',
    supply: {
      utilizationPct: 82.1,
      totalSupplied: '2.58M',
      totalSuppliedCap: '3.20M',
      totalSuppliedUsd: '$2.88B',
      totalSuppliedCapUsd: '$3.55B',
      apy: '2.51%',
      chartAvg: 'Avg 2.20%',
    },
    borrow: {
      utilizationPct: 68.4,
      totalBorrowed: '2.58M',
      totalBorrowedCap: '3.50M',
      totalBorrowedUsd: '$2.99B',
      totalBorrowedCapUsd: '$4.05B',
      apyVariable: '3.56%',
      borrowCap: '3.20M',
      borrowCapUsd: '$3.70B',
      chartAvg: 'Avg 3.10%',
    },
    collateral: {
      maxLtv: '75.00%',
      liquidationThreshold: '78.50%',
      liquidationPenalty: '4.50%',
    },
    collector: {
      reserveFactor: '10.00%',
      contractUrl: 'https://etherscan.io',
    },
    emode: [
      {
        title: 'Stablecoins',
        collateral: 'yes',
        borrowable: 'yes',
        rows: [
          { label: 'Max LTV', value: '93.00%' },
          { label: 'Liquidation threshold', value: '95.00%' },
          { label: 'Liquidation penalty', value: '1.00%' },
        ],
      },
    ],
  },
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
    asset: 'DAI',
    name: 'Dai Stablecoin',
    icon: '/icons/tokens/dai.svg',
    reserveSize: '4.91B',
    reserveSizeUsd: '4.91B',
    availableLiquidity: '2.10B',
    availableLiquidityUsd: '2.10B',
    utilizationRate: '57.20%',
    oraclePrice: '1.00',
    oraclePriceUsd: '1.00',
    supply: {
      utilizationPct: 45,
      totalSupplied: '1.65M',
      totalSuppliedCap: '4.00M',
      totalSuppliedUsd: '$4.91B',
      totalSuppliedCapUsd: '$11.90B',
      apy: '0%',
      chartAvg: 'Avg 0%',
    },
    borrow: {
      utilizationPct: 0,
      totalBorrowed: '—',
      totalBorrowedCap: '—',
      totalBorrowedUsd: '—',
      totalBorrowedCapUsd: '—',
      apyVariable: '—',
      borrowCap: '—',
      borrowCapUsd: '—',
      chartAvg: '—',
    },
    collateral: {
      maxLtv: '75.00%',
      liquidationThreshold: '80.00%',
      liquidationPenalty: '5.00%',
    },
    collector: {
      reserveFactor: '12.00%',
      contractUrl: 'https://etherscan.io',
    },
    emode: [
      {
        title: 'Stablecoins',
        collateral: 'yes',
        borrowable: 'yes',
        rows: [
          { label: 'Max LTV', value: '93.00%' },
          { label: 'Liquidation threshold', value: '95.00%' },
          { label: 'Liquidation penalty', value: '1.00%' },
        ],
      },
    ],
  },
};

export const FALLBACK_MARKET_ASSET_DETAILS: MarketAssetDetailsMock =
  MARKET_ASSET_DETAILS_BY_UNDERLYING['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'];
