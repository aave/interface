import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useStakeData = (marketData: MarketDataType) => {
  const { stakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      return stakeDataService.getStakeData(marketData);
    },
    queryKey: ['getStkTokens', marketData.marketTitle],
  });
};

export const useUserStakeData = (marketData: MarketDataType, user: string) => {
  const { stakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      return stakeDataService.getUserTakeData(marketData, user);
    },
    queryKey: ['getUserStakeData', marketData.marketTitle, user],
    enabled: !!user,
  });
};
