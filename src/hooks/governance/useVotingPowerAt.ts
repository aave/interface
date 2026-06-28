import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useVotingPowerAt = (blockhash: string, votingAssets: string[]) => {
  const { governanceV3Service } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceV3Service.getVotingPowerAt(blockhash, user, votingAssets),
    queryKey: queryKeysFactory.votingPowerAt(user, blockhash, votingAssets),
    enabled: !!user,
  });
};
