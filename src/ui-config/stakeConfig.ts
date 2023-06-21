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
  stakeDataProvider: '0x5E045cfb738F01bC73CEAFF783F4C16e8B14090b',
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      STAKING_HELPER: '0xaF630B2151b7b7F22dEf78a9830af5BED07208B3',
    },
    [Stake.bpt]: {
      TOKEN_STAKING: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
      STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    },
  },
};

export const goerliStakeConfig: StakeConfig = {
  chainId: ChainId.goerli,
  stakeDataProvider: '0xfaa9e83a1243F6486Cd1bc81D2cac94071b12056',
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: '0xb85B34C58129a9a7d54149e86934ed3922b05592',
      STAKING_REWARD_TOKEN: '0x0000000000000000000000000000000000000000',
      STAKING_HELPER: '0xaF630B2151b7b7F22dEf78a9830af5BED07208B3',
    },
    // TODO: Deploy with balancer contracts
    // [Stake.bpt]: {
    //   TOKEN_STAKING: '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
    //   STAKING_REWARD_TOKEN: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    // },
  },
};

export const sepoliaStakeConfig: StakeConfig = {
  chainId: ChainId.sepolia,
  stakeDataProvider: '0x8a1c29681c0b01d09ed5487418A812C7b6924BBf',
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: '0x47805f115eD9Dffc3506c9cB9805725FAe1cA9d3',
      STAKING_REWARD_TOKEN: '0x0000000000000000000000000000000000000000',
      STAKING_HELPER: '0xbd885E8EfaE50CBfD43AC7155d8E0b5276aeB8ac',
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
    return sepoliaStakeConfig;
    return goerliStakeConfig;
  } else {
    // mainnet staking
    return prodStakeConfig;
  }
};

export const stakeConfig: StakeConfig = {
  ...getStakeConfig(),
};
