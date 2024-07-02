import { MigrationSupplyException } from 'src/store/v3MigrationSlice';

import { MarketDataType } from './marketsConfig';
import { TokenInfo } from './TokenList';

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
  powers: (user: string, chainId: number) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    chainId,
    'powers',
  ],
  voteOnProposal: (user: string, proposalId: number, marketData: MarketDataType) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    proposalId,
    'voteOnProposal',
  ],
  votingPowerAt: (user: string, blockHash: string, votingAssets: string[]) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    ...votingAssets,
    blockHash,
    'votingPowerAt',
  ],
  governanceRepresentatives: (user: string) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    'representatives',
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
  userPoolReservesDataHumanized: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'userPoolReservesDataHumanized',
  ],
  generalStakeUiData: (marketData: MarketDataType, stakedTokens: string[], oracles: string[]) => [
    ...queryKeysFactory.staking,
    ...queryKeysFactory.market(marketData),
    stakedTokens,
    oracles,
    'generalStakeUiData',
  ],
  userStakeUiData: (
    user: string,
    marketData: MarketDataType,
    stakedAssets: string[],
    oracles: string[]
  ) => [
    ...queryKeysFactory.staking,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    stakedAssets,
    oracles,
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
  poolReservesIncentiveDataHumanized: (marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.incentives,
    ...queryKeysFactory.market(marketData),
    'poolReservesIncentiveDataHumanized',
  ],
  userPoolReservesIncentiveDataHumanized: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.incentives,
    ...queryKeysFactory.market(marketData),
    ...queryKeysFactory.user(user),
    'userPoolReservesIncentiveDataHumanized',
  ],
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
  approvedAmount: (user: string, token: string, spender: string, chainId: number) => [
    ...queryKeysFactory.user(user),
    chainId,
    token,
    spender,
    'approvedAmount',
  ],
  tokenPowers: (user: string, token: string, chainId: number) => [
    ...queryKeysFactory.user(user),
    token,
    chainId,
    'tokenPowers',
  ],
  tokenDelegatees: (user: string, token: string, chainId: number) => [
    ...queryKeysFactory.user(user),
    token,
    chainId,
    'tokenDelegatees',
  ],
  getGhoBridgeBalances: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.gho,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'getGhoBridgeBalances',
  ],
  migrationExceptions: (
    suplies: MigrationSupplyException[],
    marketFrom: MarketDataType,
    marketTo: MarketDataType
  ) => [
    ...suplies.map((supply) => supply.underlyingAsset),
    ...queryKeysFactory.market(marketFrom),
    ...queryKeysFactory.market(marketTo),
  ],
  tokensBalance: (tokenList: TokenInfo[], chainId: number, user: string) => [
    ...queryKeysFactory.user(user),
    tokenList.map((elem) => elem.address),
    chainId,
    'tokensBalance',
  ],
};

export const POLLING_INTERVAL = 60000;
