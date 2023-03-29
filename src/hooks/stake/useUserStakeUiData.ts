import { useQuery } from '@tanstack/react-query';
import { POOLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UseUserStakeUiDataArgs = {
  user: string;
};

export const useUserStakeUiData = ({ user }: UseUserStakeUiDataArgs) => {
  const { uiStakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiStakeDataService.getUserStakeUIDataHumanized({ user }),
    queryKey: [QueryKeys.USER_STAKE_UI_DATA, user],
    enabled: !!user,
    initialData: null,
    refetchInterval: POOLING_INTERVAL,
  });
};
