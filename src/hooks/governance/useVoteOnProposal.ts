import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useVoteOnProposal = (marketData: MarketDataType, proposalId: number) => {
  const { governanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceService.getVoteOnProposal(marketData, user, proposalId),
    queryKey: queryKeysFactory.voteOnProposal(user, proposalId, marketData),
    enabled: !!user,
  });
};
