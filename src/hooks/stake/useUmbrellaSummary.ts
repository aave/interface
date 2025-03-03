import {
  API_ETH_MOCK_ADDRESS,
  StakeData,
  StakeUserBalances,
  StakeUserCooldown,
  StakeUserData,
  StataTokenData,
} from '@aave/contract-helpers';
import { normalize, normalizeBN, USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { BigNumber } from 'bignumber.js';
import { calculateMaxWithdrawAmount } from 'src/components/transactions/Withdraw/utils';
import { useStakeData, useUserStakeData } from 'src/modules/umbrella/hooks/useStakeData';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { roundToTokenDecimals } from 'src/utils/utils';

import { useWalletBalances, WalletBalances } from '../app-data-provider/useWalletBalances';
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
  stataTokenAssetBalance: string;
  aTokenBalanceAvailableToStake: string;
  totalAvailableToStake: string;
  nativeTokenBalance: string;
}

interface FormattedReward {
  accrued: string;
  accruedUsd: string;
  rewardToken: string;
  rewardTokenName: string;
  rewardTokenSymbol: string;
  apy: string;
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

interface StataTokenDataExtended extends StataTokenData {
  isUnderlyingWrappedBaseToken: boolean;
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
  stataTokenData: StataTokenDataExtended;
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
    const stakeTokenPrice = normalizeBN(stakeItem.price, USD_DECIMALS).toString();
    const stakeTokenTotalSupply = normalizeBN(
      stakeItem.totalAssets,
      stakeItem.underlyingTokenDecimals
    ).toString();
    const totalSupplyUsd = valueToBigNumber(stakeTokenTotalSupply)
      .multipliedBy(stakeTokenPrice)
      .toString();

    runningTotal = runningTotal.plus(stakeTokenTotalSupply);
    runningTotalUsd = runningTotalUsd.plus(totalSupplyUsd);

    const matchingReserve = reserves.find(
      (reserve) =>
        reserve.aTokenAddress.toLowerCase() === stakeItem.stataTokenData.aToken.toLowerCase()
    );

    const totalRewardApy = getTotalStakeRewardApy(matchingReserve, stakeItem);

    return {
      tokenAddress: stakeItem.tokenAddress,
      symbol: stakeItem.underlyingIsStataToken
        ? stakeItem.stataTokenData.assetSymbol
        : stakeItem.symbol,
      iconSymbol: stakeItem.underlyingIsStataToken
        ? stakeItem.stataTokenData.assetSymbol
        : stakeItem.symbol,
      stakeTokenPrice,
      stakeTokenTotalSupply,
      totalSupplyUsd,
      totalRewardApy: normalize(totalRewardApy.toString(), 18),
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
  reserves: FormattedReservesAndIncentives[],
  walletBalances: WalletBalances
): FormattedUserStakeData => {
  let aggregatedTotalStakedUSD = valueToBigNumber('0');
  let weightedApySum = valueToBigNumber('0');

  const userReservesData = user.userReservesData;

  const mergedData = stakeData.reduce<MergedStakeData[]>((acc, stakeItem) => {
    const matchingBalance = userStakeData.find(
      (balanceItem) => balanceItem.stakeToken.toLowerCase() === stakeItem.tokenAddress.toLowerCase()
    );

    if (!matchingBalance) {
      return acc;
    }

    const stakeTokenBalance = normalizeBN(
      matchingBalance.balances.stakeTokenBalance,
      stakeItem.underlyingTokenDecimals
    );

    const stakeTokenBalanceUSD = stakeTokenBalance
      .multipliedBy(stakeItem.price)
      .shiftedBy(-USD_DECIMALS);

    const underlyingTokenBalance = normalizeBN(
      matchingBalance.balances.underlyingTokenBalance,
      stakeItem.underlyingTokenDecimals
    ).toString();

    // assuming the stake token and underlying have the same price
    const underlyingTokenBalanceUSD = BigNumber(underlyingTokenBalance)
      .multipliedBy(stakeItem.price)
      .shiftedBy(-USD_DECIMALS)
      .toString();

    const stakeTokenTotalSupply = normalizeBN(
      stakeItem.totalAssets,
      stakeItem.underlyingTokenDecimals
    ).toString();

    // we use the userReserve to get the aToken balance which takes into account accrued interest
    const userReserve = userReservesData?.find(
      (r) => r.reserve.aTokenAddress.toLowerCase() === stakeItem.stataTokenData.aToken.toLowerCase()
    );

    const reserve = reserves.find(
      (reserve) =>
        reserve.aTokenAddress.toLowerCase() === stakeItem.stataTokenData.aToken.toLowerCase()
    );

    const totalRewardApy = getTotalStakeRewardApy(reserve, stakeItem);

    weightedApySum = stakeTokenBalance.multipliedBy(totalRewardApy).plus(weightedApySum);
    aggregatedTotalStakedUSD = aggregatedTotalStakedUSD.plus(stakeTokenBalanceUSD);

    let aTokenBalanceAvailableToStake = '0';
    const nativeTokenBalance = walletBalances.walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]
      ? walletBalances.walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()].amount
      : '0';
    let isUnderlyingWrappedBaseToken = false;
    if (userReserve && reserve) {
      aTokenBalanceAvailableToStake = roundToTokenDecimals(
        calculateMaxWithdrawAmount(user, userReserve, reserve).toString(),
        stakeItem.underlyingTokenDecimals
      );
      if (reserve.isWrappedBaseAsset) {
        isUnderlyingWrappedBaseToken = true;
      }
    }

    const stataTokenAssetBalance = normalize(
      matchingBalance.balances.stataTokenAssetBalance,
      stakeItem.underlyingTokenDecimals
    );

    let totalAvailableToStake = Number(underlyingTokenBalance);
    if (stakeItem.underlyingIsStataToken) {
      totalAvailableToStake +=
        Number(stataTokenAssetBalance) + Number(aTokenBalanceAvailableToStake);
    }
    if (isUnderlyingWrappedBaseToken) {
      totalAvailableToStake += Number(nativeTokenBalance);
    }

    acc.push({
      ...stakeItem,
      stataTokenData: {
        ...stakeItem.stataTokenData,
        isUnderlyingWrappedBaseToken,
      },
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
        stataTokenAssetBalance,
        aTokenBalanceAvailableToStake,
        totalAvailableToStake: totalAvailableToStake.toString(),
        nativeTokenBalance,
      },
      formattedRewards: matchingBalance.rewards.map((reward) => {
        const rewardData = stakeItem.rewards.find(
          (rewardItem) => rewardItem.rewardAddress === reward.rewardAddress
        );

        if (!rewardData) {
          throw new Error('Reward data not found');
        }

        const accruedNormalized = normalize(reward.accrued, rewardData.decimals);
        const priceNormalized = normalize(rewardData.price, USD_DECIMALS);
        const accruedUsd = BigNumber(accruedNormalized).multipliedBy(priceNormalized).toString();

        return {
          accruedUsd,
          accrued: accruedNormalized,
          rewardToken: reward.rewardAddress,
          rewardTokenSymbol: rewardData.rewardSymbol,
          rewardTokenName: rewardData.rewardName,
          apy: normalize(rewardData.apy, 18),
        };
      }),
      formattedStakeTokenData: {
        totalAmountStaked: stakeTokenTotalSupply,
        totalAmountStakedUSD: BigNumber(stakeTokenTotalSupply)
          .multipliedBy(normalize(stakeItem.price, 8))
          .toString(),
      },
      cooldownData: matchingBalance.cooldown,
      name: stakeItem.underlyingIsStataToken
        ? stakeItem.stataTokenData.assetName
        : stakeItem.underlyingTokenName,
      symbol: stakeItem.underlyingIsStataToken
        ? stakeItem.stataTokenData.assetSymbol
        : stakeItem.underlyingTokenSymbol,
      decimals: stakeItem.underlyingTokenDecimals,
      iconSymbol: stakeItem.underlyingIsStataToken
        ? stakeItem.stataTokenData.assetSymbol
        : stakeItem.underlyingTokenSymbol,
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
  const totalRewardApy = normalizeBN(
    stakeData.rewards.reduce((acc, reward) => acc.plus(reward.apy), valueToBigNumber('0')),
    18
  );
  if (stakeData.underlyingIsStataToken) {
    if (!reserve) {
      throw new Error('Reserve is required when underlying is a stataToken');
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
  const walletBalances = useWalletBalances(marketData);

  const selector = (
    stakeData: StakeData[],
    userStakeData: StakeUserData[],
    user: ExtendedFormattedUser,
    reserves: FormattedReservesAndIncentives[]
  ) => {
    return formatUmbrellaSummary(stakeData, userStakeData, user, reserves, walletBalances);
  };

  const { data, isPending } = combineQueries(
    [stakeDataQuery, userStakeDataQuery, userReservesQuery, reservesQuery] as const,
    selector
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
