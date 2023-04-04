import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Powers } from 'src/services/GovernanceService';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const usePowers = (): UseQueryResult<Powers, Error> => {
  const { governanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceService.getPowers({ user }),
    queryKey: [QueryKeys.POWERS, user, governanceService.toHash()],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};
