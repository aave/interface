import { Box } from '@mui/material';

import { BorrowAssetsList } from './lists/BorrowAssetsList/BorrowAssetsList';
import { BorrowedPositionsList } from './lists/BorrowedPositionsList/BorrowedPositionsList';
import { BorrowedPositionsItem } from './lists/BorrowedPositionsList/types';
import { SuppliedPositionsList } from './lists/SuppliedPositionsList/SuppliedPositionsList';
import { SuppliedPositionsItem } from './lists/SuppliedPositionsList/types';
import { SupplyAssetsList } from './lists/SupplyAssetsList/SupplyAssetsList';

interface DashboardContentWrapperProps {
  suppliedPositions: SuppliedPositionsItem[];
  borrowedPositions: BorrowedPositionsItem[];
  isBorrow: boolean;
  isUserInIsolationMode?: boolean;
}

export const DashboardContentWrapper = ({
  suppliedPositions,
  borrowedPositions,
  isBorrow,
  isUserInIsolationMode,
}: DashboardContentWrapperProps) => {
  return (
    <Box>
      <Box>
        <SuppliedPositionsList listData={suppliedPositions} />
        <SupplyAssetsList />
      </Box>
      <Box>
        {!!borrowedPositions.length && <BorrowedPositionsList listData={borrowedPositions} />}
        <BorrowAssetsList borrowedReserves={borrowedPositions} />
      </Box>
    </Box>
  );
};
