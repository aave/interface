import { Trans } from '@lingui/macro';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { MigrationList } from './MigrationList';

interface MigrationListsProps {
  totalSuppliesUSD: string;
  totalBorrowsUSD: string;
  onSelectAllSupplies: () => void;
  onSelectAllBorrows: () => void;
  suppliesPositions: ReactNode;
  borrowsPositions: ReactNode;
  loading?: boolean;
  isSupplyPositionsAvailable: boolean;
  isBorrowPositionsAvailable: boolean;
}

export const MigrationLists = ({
  totalSuppliesUSD,
  totalBorrowsUSD,
  onSelectAllSupplies,
  onSelectAllBorrows,
  suppliesPositions,
  borrowsPositions,
  loading,
  isSupplyPositionsAvailable,
  isBorrowPositionsAvailable,
}: MigrationListsProps) => {
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('lg'));

  return (
    <Box
      sx={{
        display: isDesktop ? 'flex' : 'block',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllSupplies}
        isAvailable={isSupplyPositionsAvailable}
        titleComponent={<Trans>Your supplies</Trans>}
        totalAmount={totalSuppliesUSD}
        withCollateral
      >
        {suppliesPositions}
      </MigrationList>

      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllBorrows}
        isAvailable={isBorrowPositionsAvailable}
        isBottomOnMobile
        titleComponent={<Trans>Your borrows</Trans>}
        totalAmount={totalBorrowsUSD}
        // withEmode TODO: uncomment when emode logic for migration will fix
      >
        {borrowsPositions}
      </MigrationList>
    </Box>
  );
};
