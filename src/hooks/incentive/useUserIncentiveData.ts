import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseUserIncentiveDataParams = {
  lendingPoolAddressProvider: string;
};

export const useUserIncentiveData = ({
  lendingPoolAddressProvider,
}: UseUserIncentiveDataParams) => {
  const { uiIncentivesDataService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
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

export const useCMUserIncentiveData = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const lendingPoolAddressProvider = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
  return useUserIncentiveData({ lendingPoolAddressProvider });
};
