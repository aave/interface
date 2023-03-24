import { useQuery } from '@tanstack/react-query';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const USE_POWERS_KEY = 'USE_POWERS';

type UsePowersArgs = {
  user: string;
};

export const usePowers = ({ user }: UsePowersArgs) => {
  const { governanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceService.getPowers({ user }),
    queryKey: [USE_POWERS_KEY, user],
    enabled: !!user,
    refetchInterval: 60000,
  });
};
