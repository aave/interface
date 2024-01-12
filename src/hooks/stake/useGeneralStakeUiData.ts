import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useGeneralStakeUiData = (
  marketData: MarketDataType,
  stakedTokens: string[],
  oracles: string[]
) => {
  const { uiStakeDataService } = useSharedDependencies();

  return useQuery({
    queryFn: () =>
      uiStakeDataService.getGeneralStakeUIDataHumanized(marketData, stakedTokens, oracles),
    queryKey: queryKeysFactory.generalStakeUiData(marketData, stakedTokens, oracles),
    refetchInterval: POLLING_INTERVAL,
  });
};
