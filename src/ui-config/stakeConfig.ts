import { ChainId, Stake } from '@aave/contract-helpers';

export interface StakeConfig {
  chainId: ChainId;
  stakeDataProvider: string;
  tokens: {
    [token: string]: {
      TOKEN_STAKING: string;
      STAKING_REWARD_TOKEN: string;
      STAKING_HELPER?: string;
    };
  };
  queryStakeDataUrl?: string;
  wsStakeDataUrl?: string;
}

export const mainnetStakeConfig: StakeConfig = {
  chainId: ChainId.mainnet,
  stakeDataProvider: '0xc57450af527d10Fe182521AB39C1AD23c1e1BaDE',
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      STAKING_HELPER: '0xce0424653fb2fd48ed1b621bdbd60db16b2e388a',
    },
    [Stake.bpt]: {
      TOKEN_STAKING: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
      STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    },
  },
  queryStakeDataUrl: 'https://cache-api-1.aave.com/graphql',
  wsStakeDataUrl: 'wss://cache-api-1.aave.com/graphql',
};

export const getStakeConfig = () => {
  return mainnetStakeConfig;
};
