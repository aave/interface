import { useQuery } from '@tanstack/react-query';
import { POOLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UsePoolReservesArgs = {
  lendingPoolAddressProvider: string;
};

export const usePoolReserves = ({ lendingPoolAddressProvider }: UsePoolReservesArgs) => {
  const { uiPoolService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiPoolService.getReservesHumanized({ lendingPoolAddressProvider }),
    queryKey: [QueryKeys.POOL_RESERVES, lendingPoolAddressProvider],
    refetchInterval: POOLING_INTERVAL,
  });
};
