import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { GhoBorrowedPositionsListItem } from './GhoBorrowedPositionsListItem';

export const BorrowedPositionsListItemWrapper = ({
  item,
  checkMaxVariableBorrow,
}: {
  item: DashboardReserve;
  checkMaxVariableBorrow: boolean;
}) => {
  const { currentMarket } = useProtocolDataContext();

  return (
    <AssetCapsProvider asset={item.reserve}>
      {displayGhoForMintableMarket({ symbol: item.reserve.symbol, currentMarket }) ? (
        <GhoBorrowedPositionsListItem {...item} />
      ) : (
        <BorrowedPositionsListItem item={item} checkMaxVariableBorrow={checkMaxVariableBorrow} />
      )}
    </AssetCapsProvider>
  );
};
