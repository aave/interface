import { useQuery } from '@tanstack/react-query';
import { TokenNativeYield } from 'src/services/TokenNativeYieldService';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { SimplifiedUseQueryResult } from './utils';

export const useTokensNativeYield = (): SimplifiedUseQueryResult<TokenNativeYield> => {
  const { tokenNativeYieldService } = useSharedDependencies();
  return useQuery({
    queryKey: queryKeysFactory.tokensNativeYield(),
    queryFn: () => {
      const aprs = tokenNativeYieldService.getTokensNativeYield();
      return aprs;
    },
    refetchInterval: POLLING_INTERVAL,
  });
};
