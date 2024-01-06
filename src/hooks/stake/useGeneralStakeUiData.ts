import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useGeneralStakeUiData = (
  marketData: MarketDataType,
  stakedTokens: String[],
  oracleAddresses: String[]
) => {
  const { uiStakeDataService } = useSharedDependencies();
  console.log('WTF', stakedTokens, oracleAddresses);

  return useQuery({
    queryFn: () =>
      uiStakeDataService.getGeneralStakeUIDataHumanized(marketData, stakedTokens, oracleAddresses),
    queryKey: queryKeysFactory.generalStakeUiData(marketData, stakedTokens, oracleAddresses),
    refetchInterval: POLLING_INTERVAL,
  });
};
