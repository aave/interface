import { Box, useMediaQuery, useTheme } from '@mui/material';
import { MarketWarning } from 'src/components/transactions/Warnings/MarketWarning';

import { BorrowAssetsList } from './lists/BorrowAssetsList/BorrowAssetsList';
import { BorrowedPositionsList } from './lists/BorrowedPositionsList/BorrowedPositionsList';
import { SuppliedPositionsList } from './lists/SuppliedPositionsList/SuppliedPositionsList';
import { SupplyAssetsList } from './lists/SupplyAssetsList/SupplyAssetsList';

interface DashboardContentWrapperProps {
  isBorrow: boolean;
}

export const DashboardContentWrapper = ({ isBorrow }: DashboardContentWrapperProps) => {
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const paperWidth = isDesktop ? 'calc(50% - 8px)' : '100%';

  return (
    <Box>
      <MarketWarning marketName="proto_polygon" />
      <Box
        sx={{
          display: isDesktop ? 'flex' : 'block',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: { xs: isBorrow ? 'none' : 'block', lg: 'block' }, width: paperWidth }}>
          <SuppliedPositionsList />
          <SupplyAssetsList />
        </Box>

        <Box sx={{ display: { xs: !isBorrow ? 'none' : 'block', lg: 'block' }, width: paperWidth }}>
          <BorrowedPositionsList />
          <BorrowAssetsList />
        </Box>
      </Box>
    </Box>
  );
};
