import { normalize } from '@aave/math-utils';
import { Provider } from '@ethersproject/providers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { StakeDataStructOutput, StakeUserDataStructOutput } from './types/StakeDataProvider';
import { StakeDataProvider__factory } from './types/StakeDataProvider__factory';

const STAKE_DATA_PROVIDER = '0x512c8f87ac4af882ec1edaaf60177af5b8b3cfff';

export interface StakeData {
  stakeToken: string;
  stakeTokenName: string;
  stakeTokenSymbol: string;
  stakeTokenTotalSupply: string;
  stakeTokenPrice: string;
  cooldownSeconds: number;
  unstakeWindowSeconds: number;
  stakeTokenUnderlying: string;
  underlyingTokenDecimals: number;
  underlyingTokenName: string;
  underlyingTokenSymbol: string;
  underlyingIsWaToken: boolean;
  waTokenData: WaTokenData;
  rewards: Rewards[];
}

export interface WaTokenData {
  waTokenUnderlying: string;
  waTokenUnderlyingName: string;
  waTokenUnderlyingSymbol: string;
  waTokenAToken: string;
  waTokenATokenName: string;
  waTokenATokenSymbol: string;
}

export interface Rewards {
  rewardAddress: string;
  rewardName: string;
  rewardSymbol: string;
  decimals: number;
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
        stakeTokenSymbol: stakeData.stakeTokenSymbol,
        stakeTokenTotalSupply: stakeData.stakeTokenTotalSupply.toString(),
        cooldownSeconds: stakeData.cooldownSeconds.toNumber(),
        unstakeWindowSeconds: stakeData.unstakeWindowSeconds.toNumber(),
        stakeTokenUnderlying: stakeData.stakeTokenUnderlying.toLowerCase(),
        stakeTokenPrice: stakeData.stakeTokenPrice.toString(),
        underlyingTokenDecimals: stakeData.underlyingTokenDecimals,
        underlyingTokenName: stakeData.underlyingTokenName,
        underlyingTokenSymbol: stakeData.underlyingTokenSymbol,
        underlyingIsWaToken: stakeData.underlyingIsWaToken,
        waTokenData: {
          waTokenUnderlying: stakeData.waTokenData.waTokenUnderlying.toLowerCase(),
          waTokenUnderlyingName: stakeData.waTokenData.waTokenUnderlyingName,
          waTokenUnderlyingSymbol: stakeData.waTokenData.waTokenUnderlyingSymbol,
          waTokenAToken: stakeData.waTokenData.waTokenAToken.toLowerCase(),
          waTokenATokenName: stakeData.waTokenData.waTokenATokenName,
          waTokenATokenSymbol: stakeData.waTokenData.waTokenATokenSymbol,
        },
        rewards: stakeData.rewards.map((reward) => ({
          rewardAddress: reward.rewardAddress.toLowerCase(),
          rewardName: reward.rewardName,
          rewardSymbol: reward.rewardSymbol,
          decimals: reward.decimals,
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
        rewards: userStakeData.rewards.map((reward, index) => ({
          rewardAddress: reward.toLowerCase(),
          accrued: userStakeData.rewardsAccrued[index].toString(),
        })),
      };
    });
  }
}
