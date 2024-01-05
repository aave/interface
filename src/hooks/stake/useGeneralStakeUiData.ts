import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useGeneralStakeUiData = (marketData: MarketDataType) => {
  const { uiStakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiStakeDataService.getGeneralStakeUIDataHumanized(marketData),
    queryKey: queryKeysFactory.generalStakeUiData(marketData),
    refetchInterval: POLLING_INTERVAL,
  });
};
