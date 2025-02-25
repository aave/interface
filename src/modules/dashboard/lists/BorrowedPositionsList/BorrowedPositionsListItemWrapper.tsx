import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { GhoBorrowedPositionsListItem } from './GhoBorrowedPositionsListItem';

export interface BorrowedPositionsListItemWrapperProps {
  item: DashboardReserve;
  disableEModeSwitch: boolean;
}

export const BorrowedPositionsListItemWrapper = ({
  item,
  disableEModeSwitch,
}: BorrowedPositionsListItemWrapperProps) => {
  const currentMarket = useRootStore((state) => state.currentMarket);

  return (
    <AssetCapsProvider asset={item.reserve}>
      {displayGhoForMintableMarket({ symbol: item.reserve.symbol, currentMarket }) ? (
        <GhoBorrowedPositionsListItem {...item} />
      ) : (
        <BorrowedPositionsListItem item={item} disableEModeSwitch={disableEModeSwitch} />
      )}
    </AssetCapsProvider>
  );
};
