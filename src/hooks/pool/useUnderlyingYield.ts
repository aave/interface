import { useQuery } from '@tanstack/react-query';
import { UnderlyingAPYs } from 'src/services/UnderlyingYieldService';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { SimplifiedUseQueryResult } from './utils';

export const useUnderlyingYields = (): SimplifiedUseQueryResult<UnderlyingAPYs> => {
  const { underlyingYieldService } = useSharedDependencies();
  return useQuery({
    queryKey: queryKeysFactory.underlyingYields(),
    queryFn: () => underlyingYieldService.getUnderlyingAPYs(),
    refetchInterval: POLLING_INTERVAL,
  });
};
