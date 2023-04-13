import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useGeneralStakeUiData = () => {
  const { uiStakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiStakeDataService.getGeneralStakeUIDataHumanized(),
    queryKey: [QueryKeys.GENERAL_STAKE_UI_DATA],
    refetchInterval: POLLING_INTERVAL,
  });
};
