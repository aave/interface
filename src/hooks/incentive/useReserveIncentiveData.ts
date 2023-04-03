import { useQuery } from '@tanstack/react-query';
import { POOLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseReservesIncentiveData = {
  lendingPoolAddressProvider: string;
};

export const useReserveIncentiveData = ({
  lendingPoolAddressProvider,
}: UseReservesIncentiveData) => {
  const { uiIncentivesDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () =>
      uiIncentivesDataService?.getReservesIncentivesDataHumanized({ lendingPoolAddressProvider }),
    queryKey: [QueryKeys.RESERVE_INCENTIVE_DATA, lendingPoolAddressProvider],
    enabled: !!uiIncentivesDataService,
    refetchInterval: POOLING_INTERVAL,
  });
};
