import { normalize, normalizeBN, USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { useStakeData, useUserStakeData } from 'src/modules/umbrella/hooks/useStakeData';
import {
  StakeData,
  StakeUserBalances,
  StakeUserCooldown,
  StakeUserData,
} from 'src/modules/umbrella/services/StakeDataProviderService';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import {
  ExtendedFormattedUser,
  useExtendedUserSummaryAndIncentives,
} from '../pool/useExtendedUserSummaryAndIncentives';
import {
  FormattedReservesAndIncentives,
  usePoolFormattedReserves,
} from '../pool/usePoolFormattedReserves';
import { combineQueries } from '../pool/utils';

interface FormattedBalance {
  stakeTokenBalance: string;
  stakeTokenBalanceUSD: string;
  stakeTokenRedeemableAmount: string;
  underlyingTokenBalance: string;
  underlyingTokenBalanceUSD: string;
  underlyingWaTokenBalance: string;
  underlyingWaTokenATokenBalance: string;
}

interface FormattedReward {
  accrued: string;
  rewardToken: string;
  rewardTokenName: string;
  rewardTokenSymbol: string;
}

interface FormattedStakeTokenData {
  totalAmountStaked: string;
  totalAmountStakedUSD: string;
}

interface FormattedUserStakeData {
  aggregatedTotalStakedUSD: string;
  weightedAverageApy: string;
  stakeData: MergedStakeData[];
}

export interface MergedStakeData extends StakeData {
  balances: StakeUserBalances;
  formattedBalances: FormattedBalance;
  formattedRewards: FormattedReward[];
  formattedStakeTokenData: FormattedStakeTokenData;
  cooldownData: StakeUserCooldown;
  name: string;
  symbol: string;
  decimals: number;
  iconSymbol: string;
  totalStakedUSD: string;
  totalRewardApy: string;
}

export interface FormattedStakeDataSummary {
  allStakeAssetsTotalSupply: string;
  allStakeAssetsToatlSupplyUsd: string;
  stakeAssets: FormattedStakeData[];
}

export interface FormattedStakeData {
  tokenAddress: string;
  stakeTokenPrice: string;
  stakeTokenTotalSupply: string;
  totalSupplyUsd: string;
  totalRewardApy: string;
  iconSymbol: string;
  symbol: string;
}

const formatStakeData = (
  stakeData: StakeData[],
  reserves: FormattedReservesAndIncentives[]
): FormattedStakeDataSummary => {
  let runningTotal = new BigNumber(0);
  let runningTotalUsd = new BigNumber(0);

  const stakeAssets = stakeData.map((stakeItem) => {
    const stakeTokenPrice = normalizeBN(stakeItem.stakeTokenPrice, USD_DECIMALS).toString();
    const stakeTokenTotalSupply = normalizeBN(
      stakeItem.stakeTokenTotalSupply,
      stakeItem.underlyingTokenDecimals
    ).toString();
    const totalSupplyUsd = valueToBigNumber(stakeTokenTotalSupply)
      .multipliedBy(stakeTokenPrice)
      .toString();

    runningTotal = runningTotal.plus(stakeTokenTotalSupply);
    runningTotalUsd = runningTotalUsd.plus(totalSupplyUsd);

    const matchingReserve = reserves.find(
      (reserve) =>
        reserve.aTokenAddress.toLowerCase() === stakeItem.waTokenData.waTokenAToken.toLowerCase()
    );

    const totalRewardApy = getTotalStakeRewardApy(matchingReserve, stakeItem);

    return {
      tokenAddress: stakeItem.stakeToken,
      symbol: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingSymbol
        : stakeItem.stakeTokenSymbol,
      iconSymbol: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingSymbol
        : stakeItem.stakeTokenSymbol,
      stakeTokenPrice,
      stakeTokenTotalSupply,
      totalSupplyUsd,
      totalRewardApy: totalRewardApy.toString(),
    };
  });

  return {
    allStakeAssetsTotalSupply: runningTotal.toString(),
    allStakeAssetsToatlSupplyUsd: runningTotalUsd.toString(),
    stakeAssets,
  };
};

const formatUmbrellaSummary = (
  stakeData: StakeData[],
  userStakeData: StakeUserData[],
  user: ExtendedFormattedUser,
  reserves: FormattedReservesAndIncentives[]
): FormattedUserStakeData => {
  let aggregatedTotalStakedUSD = valueToBigNumber('0');
  let weightedApySum = valueToBigNumber('0');

  const userReservesData = user.userReservesData;

  const mergedData = stakeData.reduce<MergedStakeData[]>((acc, stakeItem) => {
    const matchingBalance = userStakeData.find(
      (balanceItem) => balanceItem.stakeToken.toLowerCase() === stakeItem.stakeToken.toLowerCase()
    );

    if (!matchingBalance) {
      return acc;
    }

    const stakeTokenBalance = normalizeBN(
      matchingBalance.balances.stakeTokenBalance,
      stakeItem.underlyingTokenDecimals
    );

    const stakeTokenBalanceUSD = stakeTokenBalance
      .multipliedBy(stakeItem.stakeTokenPrice)
      .shiftedBy(-USD_DECIMALS);

    const underlyingTokenBalance = normalizeBN(
      matchingBalance.balances.underlyingTokenBalance,
      stakeItem.underlyingTokenDecimals
    );

    // assuming the stake token and underlying have the same price
    const underlyingTokenBalanceUSD = underlyingTokenBalance
      .multipliedBy(stakeItem.stakeTokenPrice)
      .shiftedBy(-USD_DECIMALS)
      .toString();

    const stakeTokenTotalSupply = normalizeBN(
      stakeItem.stakeTokenTotalSupply,
      stakeItem.underlyingTokenDecimals
    );

    // we use the userReserve to get the aToken balance which takes into account accrued interest
    const userReserve = userReservesData?.find(
      (r) =>
        r.reserve.aTokenAddress.toLowerCase() === stakeItem.waTokenData.waTokenAToken.toLowerCase()
    );

    const reserve = reserves.find(
      (reserve) =>
        reserve.aTokenAddress.toLowerCase() === stakeItem.waTokenData.waTokenAToken.toLowerCase()
    );

    const totalRewardApy = getTotalStakeRewardApy(reserve, stakeItem);

    weightedApySum = stakeTokenBalance.multipliedBy(totalRewardApy).plus(weightedApySum);
    aggregatedTotalStakedUSD = aggregatedTotalStakedUSD.plus(stakeTokenBalanceUSD);

    acc.push({
      ...stakeItem,
      balances: matchingBalance.balances,
      totalRewardApy,
      formattedBalances: {
        stakeTokenBalance: stakeTokenBalance.toString(),
        stakeTokenBalanceUSD: stakeTokenBalanceUSD.toString(),
        stakeTokenRedeemableAmount: normalize(
          matchingBalance.balances.stakeTokenRedeemableAmount,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingTokenBalance: underlyingTokenBalance.toString(),
        underlyingTokenBalanceUSD,
        underlyingWaTokenBalance: normalize(
          matchingBalance.balances.underlyingWaTokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingWaTokenATokenBalance: userReserve?.underlyingBalance || '0',
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
      formattedStakeTokenData: {
        totalAmountStaked: stakeTokenTotalSupply.toString(),
        totalAmountStakedUSD: BigNumber(stakeTokenTotalSupply)
          .multipliedBy(normalize(stakeItem.stakeTokenPrice, 8))
          .toString(),
      },
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
      totalStakedUSD: `${underlyingTokenBalanceUSD}`,
    });

    return acc;
  }, []);

  return {
    aggregatedTotalStakedUSD: aggregatedTotalStakedUSD.toString(),
    weightedAverageApy: aggregatedTotalStakedUSD.isZero()
      ? '0'
      : weightedApySum.div(aggregatedTotalStakedUSD).toString(),
    stakeData: mergedData,
  };
};

const getTotalStakeRewardApy = (
  reserve: FormattedReservesAndIncentives | undefined,
  stakeData: StakeData
): string => {
  const totalRewardApy = stakeData.rewards.reduce(
    (acc, reward) => acc.plus(reward.apy),
    valueToBigNumber('0')
  );

  if (stakeData.underlyingIsWaToken) {
    if (!reserve) {
      throw new Error('Reserve is required when underlying is a waToken');
    }
    return totalRewardApy.plus(reserve.supplyAPY).toString();
  }

  return totalRewardApy.toString();
};

export const useUmbrellaSummary = (marketData: MarketDataType) => {
  const stakeDataQuery = useStakeData(marketData);
  const userStakeDataQuery = useUserStakeData(marketData);
  const userReservesQuery = useExtendedUserSummaryAndIncentives(marketData);
  const reservesQuery = usePoolFormattedReserves(marketData);

  const { data, isPending } = combineQueries(
    [stakeDataQuery, userStakeDataQuery, userReservesQuery, reservesQuery] as const,
    formatUmbrellaSummary
  );
  return { data, loading: isPending };
};

export const useStakeDataSummary = (marketData: MarketDataType) => {
  const reservesQuery = usePoolFormattedReserves(marketData);
  const stakeDataQuery = useStakeData(marketData);

  const { data, isPending } = combineQueries(
    [stakeDataQuery, reservesQuery] as const,
    formatStakeData
  );
  return { data, loading: isPending };
};
