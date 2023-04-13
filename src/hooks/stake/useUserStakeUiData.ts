import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useUserStakeUiData = () => {
  const { uiStakeDataService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => uiStakeDataService.getUserStakeUIDataHumanized({ user }),
    queryKey: [QueryKeys.USER_STAKE_UI_DATA, user],
    enabled: !!user,
    initialData: null,
    refetchInterval: POLLING_INTERVAL,
  });
};
