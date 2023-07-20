import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { GhoBorrowedPositionsListItem } from './GhoBorrowedPositionsListItem';

export const BorrowedPositionsListItemWrapper = ({ item }: { item: DashboardReserve }) => {
  const [displayGho] = useRootStore((store) => [store.displayGho]);
  const { currentMarket } = useProtocolDataContext();

  return (
    <AssetCapsProvider asset={item.reserve}>
      {displayGho({ symbol: item.reserve.symbol, currentMarket }) ? (
        <GhoBorrowedPositionsListItem {...item} key={item.underlyingAsset + item.borrowRateMode} />
      ) : (
        <BorrowedPositionsListItem item={item} />
      )}
    </AssetCapsProvider>
  );
};
