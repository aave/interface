import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { StakeDataStructOutput, StakeUserDataStructOutput } from './types/StakeDataProvider';
import { StakeDataProvider__factory } from './types/StakeDataProvider__factory';

const STAKE_DATA_PROVIDER = '0x7ac3ffaa30455a06df9719f57956bc4bb33d29a0';

export interface StakeData {
  stkToken: string;
  stkTokenName: string;
  stkTokenTotalSupply: string;
  cooldownSeconds: string;
  unstakeWindowSeconds: string;
  asset: string;
  isStataToken: boolean;
  stataTokenUnderlying: string;
  stataTokenAToken: string;
  rewards: Rewards[];
}

export interface Rewards {
  rewardAddress: string;
  index: string;
  maxEmissionPerSecond: string;
  distributionEnd: string;
  currentEmissionPerSecond: string;
}

export interface StakeUserData {
  stakeToken: string;
  stkTokenName: string;
  stakeTokenBalance: string;
  stakeTokenRedeemableAmount: string;
  underlyingTokenBalance: string;
  cooldownAmount: string;
  endOfCooldown: number;
  withdrawalWindow: number;
  rewards: UserRewards[];
}

export interface UserRewards {
  rewardAddress: string;
  accrued: string;
}

export class StakeDataProviderService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getStakeDataProvider(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    return StakeDataProvider__factory.connect(STAKE_DATA_PROVIDER, provider);
  }

  async getStakeData(marketData: MarketDataType) {
    const stakeDataProvider = this.getStakeDataProvider(marketData);
    const stakeData = await stakeDataProvider.getStakeData();
    return this.humanizeStakeData(stakeData);
  }

  async getUserTakeData(marketData: MarketDataType, user: string) {
    const stakeDataProvider = this.getStakeDataProvider(marketData);
    const userStakeData = await stakeDataProvider.getUserStakeData(user);
    return this.humanizeUserStakeData(userStakeData);
  }

  humanizeStakeData(stakeData: StakeDataStructOutput[]): StakeData[] {
    return stakeData.map((stakeData) => {
      return {
        stkToken: stakeData.stkToken.toLowerCase(),
        stkTokenName: stakeData.stkTokenName,
        stkTokenTotalSupply: stakeData.stkTokenTotalSupply.toString(),
        cooldownSeconds: stakeData.cooldownSeconds.toString(),
        unstakeWindowSeconds: stakeData.unstakeWindowSeconds.toString(),
        asset: stakeData.asset.toLowerCase(),
        isStataToken: stakeData.isStataToken,
        stataTokenUnderlying: stakeData.stataTokenUnderlying.toLowerCase(),
        stataTokenAToken: stakeData.stataTokenAToken.toLowerCase(),
        rewards: stakeData.rewards.map((reward) => ({
          rewardAddress: reward.rewardAddress.toLowerCase(),
          index: reward.index.toString(),
          maxEmissionPerSecond: reward.maxEmissionPerSecond.toString(),
          distributionEnd: reward.distributionEnd.toString(),
          currentEmissionPerSecond: reward.currentEmissionPerSecond.toString(),
        })),
      };
    });
  }

  humanizeUserStakeData(userStakeData: StakeUserDataStructOutput[]): StakeUserData[] {
    return userStakeData.map((userStakeData) => {
      return {
        stakeToken: userStakeData.stakeToken.toLowerCase(),
        stkTokenName: userStakeData.stkTokenName,
        stakeTokenBalance: userStakeData.stakeTokenBalance.toString(),
        stakeTokenRedeemableAmount: userStakeData.stakeTokenRedeemableAmount.toString(),
        underlyingTokenBalance: userStakeData.underlyingTokenBalance.toString(),
        cooldownAmount: userStakeData.cooldownAmount.toString(),
        endOfCooldown: userStakeData.endOfCooldown,
        withdrawalWindow: userStakeData.withdrawalWindow,
        rewards: userStakeData.rewards.map((reward, index) => ({
          rewardAddress: reward.toLowerCase(),
          accrued: userStakeData.rewardsAccrued[index].toString(),
        })),
      };
    });
  }
}
