import { MarketDataType } from './marketsConfig';

export const queryKeysFactory = {
  governance: ['governance'] as const,
  staking: ['staking'] as const,
  pool: ['pool'] as const,
  incentives: ['incentives'] as const,
  gho: ['gho'] as const,
  market: (marketData: MarketDataType) => [
    marketData.chainId,
    !!marketData.isFork,
    marketData.market,
  ],
  user: (user: string) => [user],
  powers: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'powers',
  ],
  voteOnProposal: (user: string, proposalId: number, marketData: MarketDataType) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    proposalId,
    'voteOnProposal',
  ],
  votingPowerAt: (
    user: string,
    strategy: string,
    blockNumber: number,
    marketData: MarketDataType
  ) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    strategy,
    blockNumber,
    'votingPowerAt',
  ],
  governanceTokens: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'governanceTokens',
  ],
  transactionHistory: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'transactionHistory',
  ],
  poolTokens: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'poolTokens',
  ],
  poolReservesDataHumanized: (marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.market(marketData),
    'poolReservesDataHumanized',
  ],
  generalStakeUiData: (marketData: MarketDataType) => [
    ...queryKeysFactory.staking,
    ...queryKeysFactory.market(marketData),
    'generalStakeUiData',
  ],
  userStakeUiData: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.staking,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'userStakeUiData',
  ],
  paraswapRates: (
    chainId: number,
    amount: string,
    srcToken: string,
    destToken: string,
    user: string
  ) => [...queryKeysFactory.user(user), chainId, amount, srcToken, destToken, 'paraswapRates'],
  gasPrices: (chainId: number) => [chainId, 'gasPrices'],
  ghoReserveData: (marketData: MarketDataType) => [
    ...queryKeysFactory.gho,
    ...queryKeysFactory.market(marketData),
    'ghoReserveData',
  ],
  ghoUserReserveData: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.gho,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'ghoUserReserveData',
  ],
  poolApprovedAmount: (user: string, token: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    token,
    'poolApprovedAmount',
  ],
  approvedAmount: (user: string, token: string, spender: string, marketData: MarketDataType) => [
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    token,
    spender,
    'approvedAmount',
  ],
};

export const POLLING_INTERVAL = 60000;
