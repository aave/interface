import { MigrationSupplyException } from 'src/store/v3MigrationSlice';

import { MarketDataType } from './marketsConfig';
import { TokenInfo } from './TokenList';

export interface QueryMarketDataType extends Pick<MarketDataType, 'chainId' | 'isFork'> {
  market: string;
}

export const queryKeysFactory = {
  governance: ['governance'] as const,
  staking: ['staking'] as const,
  pool: ['pool'] as const,
  incentives: ['incentives'] as const,
  gho: ['gho'] as const,
  market: (marketData: QueryMarketDataType) => [
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
  voteOnProposal: (user: string, proposalId: number, marketData: QueryMarketDataType) => [
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
  governanceTokens: (user: string, marketData: QueryMarketDataType) => [
    ...queryKeysFactory.governance,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'governanceTokens',
  ],
  transactionHistory: (user: string, marketData: QueryMarketDataType) => [
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'transactionHistory',
  ],
  poolTokens: (user: string, marketData: QueryMarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'poolTokens',
  ],
  poolReservesDataHumanized: (marketData: QueryMarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.market(marketData),
    'poolReservesDataHumanized',
  ],
  userPoolReservesDataHumanized: (user: string, marketData: QueryMarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'userPoolReservesDataHumanized',
  ],
  generalStakeUiData: (
    marketData: QueryMarketDataType,
    stakedTokens: string[],
    oracles: string[]
  ) => [
    ...queryKeysFactory.staking,
    ...queryKeysFactory.market(marketData),
    stakedTokens,
    oracles,
    'generalStakeUiData',
  ],
  userStakeUiData: (
    user: string,
    marketData: QueryMarketDataType,
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
  poolReservesIncentiveDataHumanized: (marketData: QueryMarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.incentives,
    ...queryKeysFactory.market(marketData),
    'poolReservesIncentiveDataHumanized',
  ],
  userPoolReservesIncentiveDataHumanized: (user: string, marketData: QueryMarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.incentives,
    ...queryKeysFactory.market(marketData),
    ...queryKeysFactory.user(user),
    'userPoolReservesIncentiveDataHumanized',
  ],
  ghoReserveData: (marketData: QueryMarketDataType) => [
    ...queryKeysFactory.gho,
    ...queryKeysFactory.market(marketData),
    'ghoReserveData',
  ],
  ghoUserReserveData: (user: string, marketData: QueryMarketDataType) => [
    ...queryKeysFactory.gho,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'ghoUserReserveData',
  ],
  poolApprovedAmount: (user: string, token: string, marketData: QueryMarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    token,
    'poolApprovedAmount',
  ],
  approvedAmount: (
    user: string,
    token: string,
    spender: string,
    marketData: QueryMarketDataType
  ) => [
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
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
  migrationExceptions: (
    suplies: MigrationSupplyException[],
    marketFrom: QueryMarketDataType,
    marketTo: QueryMarketDataType
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
