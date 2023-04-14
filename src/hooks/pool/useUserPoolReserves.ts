import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseUserPoolReservesArgs = {
  user: string;
  lendingPoolAddressProvider: string;
};

export const useUserPoolReserves = ({
  user,
  lendingPoolAddressProvider,
}: UseUserPoolReservesArgs) => {
  const { uiPoolService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiPoolService.getUserReservesHumanized({ user, lendingPoolAddressProvider }),
    queryKey: [QueryKeys.USER_POOL_RESERVES, user, lendingPoolAddressProvider],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};
