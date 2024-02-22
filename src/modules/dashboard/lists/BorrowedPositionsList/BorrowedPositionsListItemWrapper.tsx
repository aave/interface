import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { displayGho } from 'src/utils/ghoUtilities';

import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { GhoBorrowedPositionsListItem } from './GhoBorrowedPositionsListItem';

export const BorrowedPositionsListItemWrapper = ({ item }: { item: DashboardReserve }) => {
  const { currentMarket } = useProtocolDataContext();

  return (
    <AssetCapsProvider asset={item.reserve}>
      {displayGho({ symbol: item.reserve.symbol, currentMarket }) ? (
        <GhoBorrowedPositionsListItem {...item} />
      ) : (
        <BorrowedPositionsListItem item={item} />
      )}
    </AssetCapsProvider>
  );
};
