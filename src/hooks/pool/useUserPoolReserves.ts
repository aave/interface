import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseUserPoolReservesArgs = {
  lendingPoolAddressProvider: string;
};

export const useUserPoolReserves = ({ lendingPoolAddressProvider }: UseUserPoolReservesArgs) => {
  const { uiPoolService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => uiPoolService.getUserReservesHumanized({ user, lendingPoolAddressProvider }),
    queryKey: [
      QueryKeys.USER_POOL_RESERVES,
      user,
      lendingPoolAddressProvider,
      uiPoolService.toHash(),
    ],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};

export const useCMUserPoolReserves = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  return useUserPoolReserves({
    lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  });
};
