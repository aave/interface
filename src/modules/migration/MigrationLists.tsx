import { Trans } from '@lingui/macro';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { useRootStore } from 'src/store/root';

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
  const isTablet = useMediaQuery(breakpoints.up('md'));

  const { user, borrowPositions } = useUserReserves();

  const {
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  const allSuppliesSelected =
    Object.keys(selectedSupplyAssets).length === user.userReservesData.length;
  const allBorrowsSelected = Object.keys(selectedBorrowAssets).length === borrowPositions.length;
  return (
    <Box
      sx={{
        display: isTablet ? 'flex' : 'block',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllSupplies}
        allSelected={allSuppliesSelected}
        isAvailable={isSupplyPositionsAvailable}
        titleComponent={<Trans>Your supplies</Trans>}
        totalAmount={totalSuppliesUSD}
      >
        {suppliesPositions}
      </MigrationList>

      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllBorrows}
        allSelected={allBorrowsSelected}
        isAvailable={isBorrowPositionsAvailable}
        isBottomOnMobile
        titleComponent={<Trans>Your borrows</Trans>}
        totalAmount={totalBorrowsUSD}
      >
        {borrowsPositions}
      </MigrationList>
    </Box>
  );
};
