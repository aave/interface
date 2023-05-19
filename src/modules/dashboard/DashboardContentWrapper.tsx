import { Box, useMediaQuery, useTheme } from '@mui/material';
import { PolygonWarning } from 'src/components/transactions/Warnings/MarketWarning';
import { useRootStore } from 'src/store/root';

import { BorrowAssetsList } from './lists/BorrowAssetsList/BorrowAssetsList';
import { BorrowedPositionsList } from './lists/BorrowedPositionsList/BorrowedPositionsList';
import { SuppliedPositionsList } from './lists/SuppliedPositionsList/SuppliedPositionsList';
import { SupplyAssetsList } from './lists/SupplyAssetsList/SupplyAssetsList';

interface DashboardContentWrapperProps {
  isBorrow: boolean;
}

export const DashboardContentWrapper = ({ isBorrow }: DashboardContentWrapperProps) => {
  const { breakpoints } = useTheme();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const paperWidth = isDesktop ? 'calc(50% - 8px)' : '100%';

  return (
    <Box>
      {currentMarketData.marketTitle === 'proto_polygon' && <PolygonWarning />}
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
