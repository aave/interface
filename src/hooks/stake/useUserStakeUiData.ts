import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useUserStakeUiData = () => {
  const { uiStakeDataService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: async () => {
      const data = await uiStakeDataService.getUserStakeUIDataHumanized({ user });
      return { ...data, bptV2: data.bpt }; // mocking v2 data
    },
    queryKey: [QueryKeys.USER_STAKE_UI_DATA, user, uiStakeDataService.toHash()],
    enabled: !!user,
    initialData: null,
    refetchInterval: POLLING_INTERVAL,
  });
};
