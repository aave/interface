import { BigNumber } from 'bignumber.js';

const SECONDS_PER_YEAR = 31536000;

export const calculateApy = (
  emissionsPerSecond: string,
  stakeTokenTotalAssets: string,
  stakeTokenPrice: string,
  stakeTokenDecimals: number,
  rewardTokenPrice: string,
  rewardTokenDecimals: number
) => {
  const emissionsScaled = new BigNumber(emissionsPerSecond).multipliedBy(
    new BigNumber(10).exponentiatedBy(rewardTokenDecimals)
  );
  const yearlyRewards = emissionsScaled.multipliedBy(SECONDS_PER_YEAR);
  const yearlyRewardsUsd = yearlyRewards.multipliedBy(rewardTokenPrice);

  const stakeTokenTotalAssetsScaled = new BigNumber(stakeTokenTotalAssets).multipliedBy(
    new BigNumber(10).exponentiatedBy(stakeTokenDecimals)
  );

  const stakeTokenTotalAssetsScaledUsd = stakeTokenTotalAssetsScaled.multipliedBy(stakeTokenPrice);

  return yearlyRewardsUsd.dividedBy(stakeTokenTotalAssetsScaledUsd);
};
