import { Box, useMediaQuery, useTheme } from '@mui/material';

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
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('md'));
  const paperWidth = isDesktop ? 'calc(50% - 8px)' : '100%';

  return (
    <Box
      sx={{
        display: isDesktop ? 'flex' : 'block',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ width: paperWidth }}>
        <SuppliedPositionsList listData={suppliedPositions} />
        <SupplyAssetsList />
      </Box>

      <Box sx={{ width: paperWidth }}>
        <BorrowedPositionsList listData={borrowedPositions} />
        <BorrowAssetsList />
      </Box>
    </Box>
  );
};
