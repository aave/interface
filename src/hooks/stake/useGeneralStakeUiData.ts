import { useQuery } from '@tanstack/react-query';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useGeneralStakeUiData = () => {
  const { uiStakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: async () => {
      const data = await uiStakeDataService.getGeneralStakeUIDataHumanized();
      return { ...data, bptV2: data.bpt }; // mocking v2 data
    },
    queryKey: [QueryKeys.GENERAL_STAKE_UI_DATA, uiStakeDataService.toHash()],
    refetchInterval: POLLING_INTERVAL,
  });
};
