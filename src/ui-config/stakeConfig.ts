import { ChainId, Stake } from '@aave/contract-helpers';
import { AaveSafetyModule, AaveV3Ethereum } from '@bgd-labs/aave-address-book';

export interface StakeConfig {
  chainId: ChainId;
  stakeDataProvider: string;
  tokens: {
    [token: string]: {
      TOKEN_STAKING: string;
      STAKING_REWARD_TOKEN: string;
      STAKING_HELPER?: string;
      TOKEN_ORACLE: string;
    };
  };
}

export const stakeConfig: StakeConfig = {
  chainId: ChainId.mainnet,
  stakeDataProvider: '0x972377456C7ae9C070416d0234303387A14e6972', // '0xAaA57aC46145Aa4C0D75e2872ef177c73C6Cb261', // '0xd6d26c027f225d98744b845971d91234b1cfe41c', // '0xd3d9bb874c25a8a60a9384772676cb97ce50798d', // NOTE FORK v2  // '0x379f141734a714e6032c6ca37cc505a3dd1cf34d', // NOTE FORKED v1
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: AaveSafetyModule.STK_AAVE,
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      STAKING_HELPER: '0xce0424653fb2fd48ed1b621bdbd60db16b2e388a',
      TOKEN_ORACLE: AaveV3Ethereum.ASSETS.AAVE.ORACLE,
    },
    [Stake.bpt]: {
      TOKEN_STAKING: AaveSafetyModule.STK_ABPT,
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      TOKEN_ORACLE: AaveSafetyModule.STK_ABPT_ORACLE,
    },
    ['gho']: {
      TOKEN_STAKING: '0xcC12d8ed9111cA6a99BE5ded6F9CD6f21C360502', // TODO stkGHO FORK
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      TOKEN_ORACLE: '0x3f12643d3f6f874d39c2a4c9f2cd6f2dbac877fc', // TODO GHO ORACLE ADDRESS BOOK
    },
  },
};
