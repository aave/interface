import { BigNumberValue, normalize, valueToBigNumber } from '@aave/math-utils';
import { BigNumber } from 'ethers/lib/ethers';
import { useStakeData, useUserStakeData } from 'src/modules/umbrella/hooks/useStakeData';
import {
  StakeData,
  StakeUserBalances,
  StakeUserCooldown,
  StakeUserData,
} from 'src/modules/umbrella/services/StakeDataProviderService';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { combineQueries } from '../pool/utils';

interface FormattedBalance {
  stakeTokenBalance: string;
  stakeTokenRedeemableAmount: string;
  underlyingTokenBalance: string;
  underlyingWaTokenBalance: string;
  underlyingWaTokenATokenBalance: string;
}

interface FormattedReward {
  accrued: string;
  rewardToken: string;
  rewardTokenName: string;
  rewardTokenSymbol: string;
}

export interface MergedStakeData extends StakeData {
  balances: StakeUserBalances;
  formattedBalances: FormattedBalance;
  formattedRewards: FormattedReward[];
  cooldownData: StakeUserCooldown;
  name: string;
  symbol: string;
  decimals: number;
  iconSymbol: string;
  totalStakedUSD: string;
  aggregatedTotalStakedUSD: string;
}

const formatUmbrellaSummary = (stakeData: StakeData[], userStakeData: StakeUserData[]) => {
  let aggregatedTotalStakedUSD = valueToBigNumber('0');
  stakeData.forEach((stakeItem) => {
    const matchingBalance = userStakeData.find(
      (balanceItem) => balanceItem.stakeToken.toLowerCase() === stakeItem.stakeToken.toLowerCase()
    );

    if (matchingBalance) {
      const stakeValue = valueToBigNumber(matchingBalance.balances.stakeTokenBalance)
        .multipliedBy(valueToBigNumber(stakeItem.waTokenData.waTokenPrice))
        .dividedBy(10 ** (stakeItem.underlyingTokenDecimals * 2));

      aggregatedTotalStakedUSD = aggregatedTotalStakedUSD.plus(stakeValue);
    }
  });

  const mergedData = stakeData.reduce<MergedStakeData[]>((acc, stakeItem) => {
    const matchingBalance = userStakeData.find(
      (balanceItem) => balanceItem.stakeToken.toLowerCase() === stakeItem.stakeToken.toLowerCase()
    );

    if (!matchingBalance) {
      return acc;
    }

    const stakeValue = valueToBigNumber(matchingBalance.balances.stakeTokenBalance)
      .multipliedBy(stakeItem.waTokenData.waTokenPrice)
      .dividedBy(10 ** (stakeItem.underlyingTokenDecimals * 2));

    acc.push({
      ...stakeItem,
      balances: matchingBalance.balances,
      formattedBalances: {
        stakeTokenBalance: normalize(
          matchingBalance.balances.stakeTokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
        stakeTokenRedeemableAmount: normalize(
          matchingBalance.balances.stakeTokenRedeemableAmount,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingTokenBalance: normalize(
          matchingBalance.balances.underlyingTokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingWaTokenBalance: normalize(
          matchingBalance.balances.underlyingWaTokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingWaTokenATokenBalance: normalize(
          matchingBalance.balances.underlyingWaTokenATokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
      },
      formattedRewards: matchingBalance.rewards.map((reward) => {
        const rewardData = stakeItem.rewards.find(
          (rewardItem) => rewardItem.rewardAddress === reward.rewardAddress
        );

        if (!rewardData) {
          throw new Error('Reward data not found');
        }

        return {
          accrued: normalize(reward.accrued, rewardData.decimals),
          rewardToken: reward.rewardAddress,
          rewardTokenSymbol: rewardData.rewardSymbol,
          rewardTokenName: rewardData.rewardName,
        };
      }),
      cooldownData: matchingBalance.cooldown,
      name: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingName
        : stakeItem.stakeTokenName,
      symbol: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingSymbol
        : stakeItem.stakeTokenSymbol,
      decimals: stakeItem.underlyingTokenDecimals,
      iconSymbol: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingSymbol
        : stakeItem.stakeTokenSymbol,
      totalStakedUSD: `${stakeValue.toFixed(2)}`,
      aggregatedTotalStakedUSD: `${aggregatedTotalStakedUSD.toFixed(2)}`,
    });

    return acc;
  }, []);

  return mergedData;
};

function calculateStakedValueUSD(
  stakeTokenBalance: BigNumberValue,
  decimals: number,
  waTokenPrice: BigNumberValue
): string {
  const balance = valueToBigNumber(stakeTokenBalance);
  const price = valueToBigNumber(waTokenPrice);

  const value = balance.multipliedBy(price).dividedBy(10 ** decimals);

  return `${value.toFixed(2)}`;
}

export const useUmbrellaSummary = (marketData: MarketDataType) => {
  const stakeDataQuery = useStakeData(marketData);
  const userStakeDataQuery = useUserStakeData(marketData);

  return combineQueries([stakeDataQuery, userStakeDataQuery] as const, formatUmbrellaSummary);
};

interface AssetData {
  stakeTokenBalance: string;
  decimals: number;
  waTokenPrice: string;
}

export const calculateTotalStakedUSD = (assets: AssetData[]): string => {
  try {
    const total = assets.reduce((sum, asset) => {
      const assetValue = calculateStakedValueUSD(
        asset.stakeTokenBalance,
        asset.decimals,
        asset.waTokenPrice
      );
      return sum.add(assetValue);
    }, BigNumber.from(0));

    return `${Number(total).toFixed(2)}`;
  } catch (error) {
    throw new Error(
      `Failed to calculate total staked value: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};
