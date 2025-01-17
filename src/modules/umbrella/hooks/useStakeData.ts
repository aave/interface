import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { HookOpts } from 'src/hooks/commonTypes';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { Rewards, StakeData, StakeUserData } from '../services/StakeDataProviderService';

export const selectStakeDataByAddress = (stakeData: StakeData[], address: string) =>
  stakeData.find((elem) => elem.stakeToken === address);
export const selectUserStakeDataByAddress = (stakeData: StakeUserData[], address: string) =>
  stakeData.find((elem) => elem.stakeToken === address);

export const useStakeData = <T = StakeData[]>(
  marketData: MarketDataType,
  opts?: HookOpts<StakeData[], T>
) => {
  const { stakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      return stakeDataService.getStakeData(marketData);
    },
    queryKey: ['getStkTokens', marketData.marketTitle],
    ...opts,
  });
};

export const useUserStakeData = <T = StakeUserData[]>(
  marketData: MarketDataType,
  opts?: HookOpts<StakeUserData[], T>
) => {
  const { stakeDataService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => {
      return stakeDataService.getUserTakeData(marketData, user);
    },
    queryKey: ['getUserStakeData', marketData.marketTitle, user],
    enabled: !!user,
    ...opts,
  });
};

export const useRewardsApy = (rewards: Rewards[]) => {
  return useMemo(() => {
    if (!rewards.length || rewards[0].currentEmissionPerSecond === '0') {
      return '0';
    }

    const now = Math.floor(Date.now() / 1000);
    if (Number(rewards[0].distributionEnd) < now) {
      return '0';
    }

    return rewards[0].apy;
  }, [rewards]);
};
