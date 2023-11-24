import { ChainId, Stake } from '@aave/contract-helpers';
import { AaveSafetyModule, AaveV2Ethereum } from '@bgd-labs/aave-address-book';

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

export const stakeConfig: StakeConfig = {
  chainId: ChainId.mainnet,
  stakeDataProvider: '0x5E045cfb738F01bC73CEAFF783F4C16e8B14090b',
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: AaveSafetyModule.STK_AAVE,
      STAKING_REWARD_TOKEN: AaveV2Ethereum.ASSETS.AAVE.UNDERLYING,
      STAKING_HELPER: '0xce0424653fb2fd48ed1b621bdbd60db16b2e388a',
    },
    [Stake.bpt]: {
      TOKEN_STAKING: AaveSafetyModule.STK_ABPT,
      STAKING_REWARD_TOKEN: AaveSafetyModule.STK_ABPT_ORACLE,
    },
  },
};
