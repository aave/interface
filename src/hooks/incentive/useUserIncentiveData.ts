import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseUserIncentiveDataParams = {
  lendingPoolAddressProvider: string;
  user: string;
};

export const useUserIncentiveData = ({
  lendingPoolAddressProvider,
  user,
}: UseUserIncentiveDataParams) => {
  const { uiIncentivesDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () =>
      uiIncentivesDataService?.getUserReservesIncentivesData({ lendingPoolAddressProvider, user }),
    queryKey: [QueryKeys.USER_INCENTIVE_DATA, lendingPoolAddressProvider],
    enabled: !!user && !!uiIncentivesDataService,
    refetchInterval: POLLING_INTERVAL,
  });
};
