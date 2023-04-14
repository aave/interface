import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useUserIncentiveData = () => {
  const { uiIncentivesDataService } = useSharedDependencies();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const user = useRootStore((store) => store.account);
  const lendingPoolAddressProvider = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
  return useQuery({
    queryFn: () =>
      uiIncentivesDataService?.getUserReservesIncentivesData({ lendingPoolAddressProvider, user }),
    queryKey: [
      QueryKeys.USER_INCENTIVE_DATA,
      user,
      lendingPoolAddressProvider,
      uiIncentivesDataService?.toHash(),
    ],
    enabled: !!user && !!uiIncentivesDataService,
    refetchInterval: POLLING_INTERVAL,
  });
};
