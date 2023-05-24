import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useUserIncentiveData = (marketData: MarketDataType) => {
  const { uiIncentivesDataService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => uiIncentivesDataService?.getUserReservesIncentivesData(marketData, user),
    queryKey: [QueryKeys.USER_INCENTIVE_DATA, user, marketData],
    enabled: !!user && !!uiIncentivesDataService,
    refetchInterval: POLLING_INTERVAL,
  });
};

export const useCMUserIncentiveData = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  return useUserIncentiveData(currentMarketData);
};
