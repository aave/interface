import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { StakeDataStructOutput, StakeUserDataStructOutput } from './types/StakeDataProvider';
import { StakeDataProvider__factory } from './types/StakeDataProvider__factory';

const STAKE_DATA_PROVIDER = '0x508b0d26b00bcfa1b1e9783d1194d4a5efe9d19e';

export interface StakeData {
  stakeToken: string;
  stakeTokenName: string;
  stakeTokenTotalSupply: string;
  cooldownSeconds: string;
  unstakeWindowSeconds: string;
  stakeTokenUnderlying: string;
  underlyingIsWaToken: boolean;
  waTokenUnderlying: string;
  waTokenAToken: string;
  waTokenPrice: string;
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
  stakeTokenName: string;
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
        stakeToken: stakeData.stakeToken.toLowerCase(),
        stakeTokenName: stakeData.stakeTokenName,
        stakeTokenTotalSupply: stakeData.stakeTokenTotalSupply.toString(),
        cooldownSeconds: stakeData.cooldownSeconds.toString(),
        unstakeWindowSeconds: stakeData.unstakeWindowSeconds.toString(),
        stakeTokenUnderlying: stakeData.stakeTokenUnderlying.toLowerCase(),
        underlyingIsWaToken: stakeData.underlyingIsWaToken,
        waTokenUnderlying: stakeData.waTokenUnderlying.toLowerCase(),
        waTokenAToken: stakeData.waTokenAToken.toLowerCase(),
        waTokenPrice: stakeData.waTokenPrice.toString(), // 8 decimals
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
        stakeTokenName: userStakeData.stakeTokenName,
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
