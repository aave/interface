import { normalize } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { StakeDataStructOutput, StakeUserDataStructOutput } from './types/StakeDataProvider';
import { StakeDataProvider__factory } from './types/StakeDataProvider__factory';

const STAKE_DATA_PROVIDER = '0x3e965db7b1baa260b65208e3f508ed84344ebd75';

export interface StakeData {
  stakeToken: string;
  stakeTokenName: string;
  stakeTokenTotalSupply: string;
  cooldownSeconds: string;
  unstakeWindowSeconds: string;
  stakeTokenUnderlying: string;
  underlyingIsWaToken: boolean;
  waTokenData: WaTokenData;
  rewards: Rewards[];
}

export interface WaTokenData {
  waTokenUnderlying: string;
  waTokenAToken: string;
  waTokenPrice: string;
}

export interface Rewards {
  rewardAddress: string;
  index: string;
  maxEmissionPerSecond: string;
  distributionEnd: string;
  currentEmissionPerSecond: string;
  apy: string;
}

export interface StakeUserData {
  stakeToken: string;
  stakeTokenName: string;
  balances: StakeUserBalances;
  cooldown: StakeUserCooldown;
  underlyingTokenDecimals: number;
  rewards: UserRewards[];
}

export interface StakeUserBalances {
  stakeTokenBalance: string;
  stakeTokenRedeemableAmount: string;
  underlyingTokenBalance: string;
  underlyingWaTokenBalance: string;
  underlyingWaTokenATokenBalance: string;
}

export interface StakeUserCooldown {
  cooldownAmount: string;
  endOfCooldown: number;
  withdrawalWindow: number;
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
        waTokenData: {
          waTokenUnderlying: stakeData.waTokenData.waTokenUnderlying.toLowerCase(),
          waTokenAToken: stakeData.waTokenData.waTokenAToken.toLowerCase(),
          waTokenPrice: stakeData.waTokenData.waTokenPrice.toString(), // 8 decimals
        },
        rewards: stakeData.rewards.map((reward) => ({
          rewardAddress: reward.rewardAddress.toLowerCase(),
          index: reward.index.toString(),
          maxEmissionPerSecond: reward.maxEmissionPerSecond.toString(),
          distributionEnd: reward.distributionEnd.toString(),
          currentEmissionPerSecond: reward.currentEmissionPerSecond.toString(),
          apy: normalize(reward.apy.toString(), 18),
        })),
      };
    });
  }

  humanizeUserStakeData(userStakeData: StakeUserDataStructOutput[]): StakeUserData[] {
    return userStakeData.map((userStakeData) => {
      return {
        stakeToken: userStakeData.stakeToken.toLowerCase(),
        stakeTokenName: userStakeData.stakeTokenName,
        balances: {
          stakeTokenBalance: userStakeData.balances.stakeTokenBalance.toString(),
          stakeTokenRedeemableAmount: userStakeData.balances.stakeTokenRedeemableAmount.toString(),
          underlyingTokenBalance: userStakeData.balances.underlyingTokenBalance.toString(),
          underlyingWaTokenBalance: userStakeData.balances.underlyingWaTokenBalance.toString(),
          underlyingWaTokenATokenBalance:
            userStakeData.balances.underlyingWaTokenATokenBalance.toString(),
        },
        cooldown: {
          cooldownAmount: userStakeData.cooldown.cooldownAmount.toString(),
          endOfCooldown: userStakeData.cooldown.endOfCooldown,
          withdrawalWindow: userStakeData.cooldown.withdrawalWindow,
        },
        underlyingTokenDecimals: userStakeData.underlyingTokenDecimals,
        rewards: userStakeData.rewards.map((reward, index) => ({
          rewardAddress: reward.toLowerCase(),
          accrued: userStakeData.rewardsAccrued[index].toString(),
        })),
      };
    });
  }
}
