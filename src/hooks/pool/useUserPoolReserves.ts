import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useUserPoolReserves = (marketData: MarketDataType) => {
  const { uiPoolService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => uiPoolService.getUserReservesHumanized(marketData, user),
    queryKey: [QueryKeys.USER_POOL_RESERVES, user, marketData],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};

export const useCMUserPoolReserves = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  return useUserPoolReserves(currentMarketData);
};
