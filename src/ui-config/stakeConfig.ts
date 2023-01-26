import { ChainId, Stake } from '@aave/contract-helpers';
import { STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';

export interface StakeConfig {
  chainId: ChainId;
  stakeUiHelper: string;
  tokens: {
    [token: string]: {
      STAKING_TOKEN_ADDRESS: string;
      STAKING_REWARD_TOKEN: string;
      STAKING_HELPER?: string;
    };
  };
}

export const prodStakeConfig: StakeConfig = {
  chainId: ChainId.mainnet,
  stakeUiHelper: '0xc57450af527d10Fe182521AB39C1AD23c1e1BaDE',
  tokens: {
    [Stake.aave]: {
      STAKING_TOKEN_ADDRESS: '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      STAKING_HELPER: '0xce0424653fb2fd48ed1b621bdbd60db16b2e388a',
    },
    [Stake.bpt]: {
      STAKING_TOKEN_ADDRESS: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
      STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    },
  },
};

export const goerliStakeConfig: StakeConfig = {
  chainId: ChainId.goerli,
  stakeUiHelper: '0x02119C949D827ca1FaFFDb17B14E6A9dEE04f410',
  tokens: {
    [Stake.aave]: {
      STAKING_TOKEN_ADDRESS: '0xb85B34C58129a9a7d54149e86934ed3922b05592',
      STAKING_REWARD_TOKEN: '0x0000000000000000000000000000000000000000',
      STAKING_HELPER: '0xe914d574975a1cd273388035db4413dda788c0e5',
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
