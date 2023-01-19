import { ChainId, Stake } from '@aave/contract-helpers';
import { STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';

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
}

export const prodStakeConfig: StakeConfig = {
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
};

export const goerliStakeConfig: StakeConfig = {
  chainId: ChainId.goerli,
  stakeDataProvider: '0xf46c27acea33167b9940dbe1b21b45232821e86e',
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: '0x716AD55707ddbA3Bb180f717688A21C315Ce6A49',
      STAKING_REWARD_TOKEN: '0x0000000000000000000000000000000000000000',
      STAKING_HELPER: '0x0914D87e809EC9138A4695A2854Edf00f8581658',
    },
    // TODO: Deploy with balancer contracts
    // [Stake.bpt]: {
    //   TOKEN_STAKING: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
    //   STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    // },
  },
};

const getStakeConfig = (): StakeConfig => {
  if (STAGING_ENV) {
    // goerli staking
    return goerliStakeConfig;
  } else {
    // mainnet staking
    return prodStakeConfig;
  }
};

export const stakeConfig: StakeConfig = {
  ...getStakeConfig(),
};
