import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useReserveIncentiveData = () => {
  const { uiIncentivesDataService } = useSharedDependencies();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const lendingPoolAddressProvider = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
  return useQuery({
    queryFn: () =>
      uiIncentivesDataService?.getReservesIncentivesDataHumanized({ lendingPoolAddressProvider }),
    queryKey: [
      QueryKeys.RESERVE_INCENTIVE_DATA,
      lendingPoolAddressProvider,
      uiIncentivesDataService?.toHash(),
    ],
    enabled: !!uiIncentivesDataService,
    refetchInterval: POLLING_INTERVAL,
  });
};
