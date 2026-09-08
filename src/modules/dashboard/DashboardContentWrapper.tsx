import { Box } from '@mui/material';

import { BorrowAssetsList } from './lists/BorrowAssetsList/BorrowAssetsList';
import { BorrowedPositionsList } from './lists/BorrowedPositionsList/BorrowedPositionsList';
import { SuppliedPositionsList } from './lists/SuppliedPositionsList/SuppliedPositionsList';
import { SupplyAssetsList } from './lists/SupplyAssetsList/SupplyAssetsList';

const paperWidth = { xs: '100%', lg: 'calc(50% - 1rem)' };

interface DashboardContentWrapperProps {
  isBorrow: boolean;
}

export const DashboardContentWrapper = ({ isBorrow }: DashboardContentWrapperProps) => {
  return (
    <Box
      sx={{
        display: { xs: 'block', lg: 'flex' },
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          position: 'relative',

          display: { xs: isBorrow ? 'none' : 'block', lg: 'block' },
          width: paperWidth,
        }}
      >
        <SuppliedPositionsList />
        <SupplyAssetsList />
      </Box>

      <Box
        sx={{
          position: 'relative',

          display: { xs: !isBorrow ? 'none' : 'block', lg: 'block' },
          width: paperWidth,
        }}
      >
        <BorrowedPositionsList />
        <BorrowAssetsList />
      </Box>
    </Box>
  );
};
