import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const usePoolReserves = (marketData: MarketDataType) => {
  const { uiPoolService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiPoolService.getReservesHumanized(marketData),
    queryKey: [QueryKeys.POOL_RESERVES, marketData],
    refetchInterval: POLLING_INTERVAL,
  });
};

export const useCMPoolReserves = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  return usePoolReserves(currentMarketData);
};
