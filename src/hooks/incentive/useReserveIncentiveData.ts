import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useReserveIncentiveData = (marketData: MarketDataType) => {
  const { uiIncentivesDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiIncentivesDataService.getReservesIncentivesDataHumanized(marketData),
    queryKey: [QueryKeys.RESERVE_INCENTIVE_DATA, marketData],
    enabled: !!uiIncentivesDataService,
    refetchInterval: POLLING_INTERVAL,
  });
};

export const useCMReserveIncentiveData = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  return useReserveIncentiveData(currentMarketData);
};
