import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Powers } from 'src/services/GovernanceService';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type UsePowersArgs = {
  user: string;
};

export const usePowers = ({ user }: UsePowersArgs): UseQueryResult<Powers, Error> => {
  const { governanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceService.getPowers({ user }),
    queryKey: [QueryKeys.USE_POWERS, user, governanceService.toHash()],
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
  });
};
