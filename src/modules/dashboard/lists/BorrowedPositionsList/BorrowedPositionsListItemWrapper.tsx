import { AssetCapsProvider } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

import { BorrowedPositionsListItem } from './BorrowedPositionsListItem';
import { GhoBorrowedPositionsListItem } from './GhoBorrowedPositionsListItem';

export interface BorrowedPositionsListItemWrapperProps {
  item: DashboardReserve;
  userEMode: number;
}

export const BorrowedPositionsListItemWrapper = ({
  item,
  userEMode,
}: BorrowedPositionsListItemWrapperProps) => {
  const { currentMarket } = useProtocolDataContext();

  return (
    <AssetCapsProvider asset={item.reserve}>
      {displayGhoForMintableMarket({ symbol: item.reserve.symbol, currentMarket }) ? (
        <GhoBorrowedPositionsListItem {...item} />
      ) : (
        <BorrowedPositionsListItem item={item} userEMode={userEMode} />
      )}
    </AssetCapsProvider>
  );
};
