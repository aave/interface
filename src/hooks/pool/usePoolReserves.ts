import { ReservesDataHumanized } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { HookOpts } from '../commonTypes';

export const usePoolReservesHumanized = <T = ReservesDataHumanized>(marketData: MarketDataType, opts?: HookOpts<ReservesDataHumanized, T>) => {
  const { uiPoolService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiPoolService.getReservesHumanized(marketData),
    queryKey: [QueryKeys.RESERVES_DATA_HUMANIZED, marketData],
    refetchInterval: POLLING_INTERVAL,
    ...opts,
  });
};
