import { ReservesDataHumanized } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsReservesHumanized = <T = ReservesDataHumanized[]>(
  marketsData: MarketDataType[],
  opts?: HookOpts<ReservesDataHumanized[], T>
) => {
  const { uiPoolService } = useSharedDependencies();
  return useQuery({
    queryFn: () =>
      Promise.all(marketsData.map((marketData) => uiPoolService.getReservesHumanized(marketData))),
    queryKey: [QueryKeys.POOL_RESERVES_DATA_HUMANIZED, marketsData],
    refetchInterval: POLLING_INTERVAL,
    ...opts,
  });
};

export const usePoolReservesHumanized = (marketData: MarketDataType) => {
  return usePoolsReservesHumanized([marketData], { select: (marketsData) => marketsData[0] });
};
