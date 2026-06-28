import { StakeData, StakeUserData } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { HookOpts } from 'src/hooks/commonTypes';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const selectStakeDataByAddress = (stakeData: StakeData[], address: string) =>
  stakeData.find((elem) => elem.tokenAddress === address);
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
    queryKey: queryKeysFactory.umbrellaStakeData(marketData),
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
      return stakeDataService.getUserStakeData(marketData, user);
    },
    queryKey: queryKeysFactory.umbrellaStakeUserData(user, marketData),
    enabled: !!user,
    ...opts,
  });
};
