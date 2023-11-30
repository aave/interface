import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useVotingPowerAt = (marketData: MarketDataType, strategy: string, block: number) => {
  const { governanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => governanceService.getVotingPowerAt(marketData, user, strategy, block),
    queryKey: queryKeysFactory.votingPowerAt(user, strategy, block, marketData),
    enabled: !!user,
  });
};
