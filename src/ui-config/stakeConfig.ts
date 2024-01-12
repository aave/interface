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

export const STK_AAVE_ORACLE = '0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012'; //NOTE ITS AAVE ORACLE

export const stakeConfig: StakeConfig = {
  chainId: ChainId.mainnet,
  stakeDataProvider: '0xAaA57aC46145Aa4C0D75e2872ef177c73C6Cb261', // '0xd6d26c027f225d98744b845971d91234b1cfe41c', // '0xd3d9bb874c25a8a60a9384772676cb97ce50798d', // NOTE FORK v2  // '0x379f141734a714e6032c6ca37cc505a3dd1cf34d', // NOTE FORKED v1
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: AaveSafetyModule.STK_AAVE, // '0x4da27a545c0c5b758a6ba100e3a049001de870f5',
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING, // '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      STAKING_HELPER: '0xce0424653fb2fd48ed1b621bdbd60db16b2e388a',
      TOKEN_ORACLE: '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
    },
    [Stake.bpt]: {
      TOKEN_STAKING: AaveSafetyModule.STK_ABPT, // '0xa1116930326D21fB917d5A27F1E9943A9595fb47',
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING, // '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      TOKEN_ORACLE: '0x0De156f178a20114eeec0eBF71d7772064476b0D',
    },
    [Stake.gho]: {
      TOKEN_STAKING: '0xcC12d8ed9111cA6a99BE5ded6F9CD6f21C360502', // stkGHO FORK
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      TOKEN_ORACLE: '0x',
    },
  },
};
