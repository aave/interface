import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UsePoolReservesArgs = {
  lendingPoolAddressProvider: string;
};

export const usePoolReserves = ({ lendingPoolAddressProvider }: UsePoolReservesArgs) => {
  const { uiPoolService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiPoolService.getReservesHumanized({ lendingPoolAddressProvider }),
    queryKey: [QueryKeys.POOL_RESERVES, lendingPoolAddressProvider, uiPoolService.toHash()],
    refetchInterval: POLLING_INTERVAL,
  });
};

export const useCMPoolReserves = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  return usePoolReserves({
    lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  });
};
