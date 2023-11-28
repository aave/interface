import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useUserStakeUiData = (marketData: MarketDataType) => {
  const { uiStakeDataService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => uiStakeDataService.getUserStakeUIDataHumanized(marketData, user),
    queryKey: queryKeysFactory.userStakeUiData(user, marketData),
    enabled: !!user,
    initialData: null,
    refetchInterval: POLLING_INTERVAL,
  });
};
