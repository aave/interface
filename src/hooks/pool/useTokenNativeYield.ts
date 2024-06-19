import { useQueries } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

// type TokenNativeYieldData = Map<string, string>;

export const useTokensNativeYield = (marketsData: MarketDataType[]) => {
  // marketsData[0].market
  const { tokenNativeYieldService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: queryKeysFactory.tokensNativeYield(marketData),
      queryFn: () => {
        console.log('queryFn', marketData);
        tokenNativeYieldService.getTokensNativeYield(marketData.chainId);
        return null;
      },
      enabled: !!marketData.v3,
      refetchInterval: POLLING_INTERVAL,
    })),
  });
};

export const useTokenNativeYield = (marketData: MarketDataType) => {
  return useTokensNativeYield([marketData])[0];
};
