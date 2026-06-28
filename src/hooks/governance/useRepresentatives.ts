import { useQuery } from '@tanstack/react-query';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useRepresentatives = (user: string) => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getRepresentationData(user),
    queryKey: ['governance', user, 'representatives'],
    enabled: !!user,
  });
};
