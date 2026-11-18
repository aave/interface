import { useMemo } from 'react';
import { ReserveWithId, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { isAssetHidden } from 'src/modules/dashboard/lists/constants';
import { useRootStore } from 'src/store/root';

export const useMarketConfigReserves = (): ReserveWithId[] => {
  const { supplyReserves, borrowReserves } = useAppDataContext();
  const currentMarket = useRootStore((store) => store.currentMarket);

  return useMemo(() => {
    const byAddress = new Map<string, ReserveWithId>();
    [...supplyReserves, ...borrowReserves].forEach((reserve) => {
      const address = reserve.underlyingToken.address.toLowerCase();
      if (!byAddress.has(address) && !isAssetHidden(currentMarket, address)) {
        byAddress.set(address, reserve);
      }
    });
    return Array.from(byAddress.values());
  }, [supplyReserves, borrowReserves, currentMarket]);
};
