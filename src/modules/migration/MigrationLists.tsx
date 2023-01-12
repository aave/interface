import { Trans } from '@lingui/macro';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode, useCallback } from 'react';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { useRootStore } from 'src/store/root';
import { selectUserReservesForMigration } from 'src/store/v3MigrationSelectors';

import { MigrationList } from './MigrationList';
import { MigrationMobileList } from './MigrationMobileList';

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
  emodeCategoryId?: number;
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
  emodeCategoryId,
}: MigrationListsProps) => {
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const isMobile = useMediaQuery(breakpoints.down('xsm'));

  const { user, borrowPositions } = useUserReserves();

  const {
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  const { supplyReserves, borrowReserves } = useRootStore(
    useCallback((state) => selectUserReservesForMigration(state, 0), [])
  );

  const allSuppliesSelected =
    Object.keys(selectedSupplyAssets).length === user.userReservesData.length;
  const allBorrowsSelected = Object.keys(selectedBorrowAssets).length === borrowPositions.length;
  return (
    <Box
      sx={{
        display: isDesktop ? 'flex' : 'block',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      {isMobile ? (
        <MigrationMobileList
          loading={loading}
          onSelectAllClick={onSelectAllSupplies}
          allSelected={allSuppliesSelected}
          isAvailable={isSupplyPositionsAvailable}
          titleComponent={<Trans>Select v2 supplies to migrate</Trans>}
          emodeCategoryId={emodeCategoryId}
          numSelected={selectedSupplyAssets?.length || 0}
          numAvailable={supplyReserves?.length || 0}
        >
          {suppliesPositions}
        </MigrationMobileList>
      ) : (
        <MigrationList
          loading={loading}
          onSelectAllClick={onSelectAllSupplies}
          allSelected={allSuppliesSelected}
          isAvailable={isSupplyPositionsAvailable}
          titleComponent={<Trans>Select v2 supplies to migrate</Trans>}
          emodeCategoryId={emodeCategoryId}
          withCollateral
          totalAmount={totalSuppliesUSD}
          numSelected={selectedSupplyAssets?.length || 0}
          numAvailable={supplyReserves?.length || 0}
        >
          {suppliesPositions}
        </MigrationList>
      )}

      {isMobile ? (
        <MigrationMobileList
          loading={loading}
          onSelectAllClick={onSelectAllBorrows}
          allSelected={allBorrowsSelected}
          isAvailable={isBorrowPositionsAvailable}
          isBottomOnMobile
          titleComponent={<Trans>Select v2 borrows to migrate</Trans>}
          numSelected={selectedBorrowAssets?.length || 0}
          numAvailable={borrowReserves?.length || 0}
        >
          {borrowsPositions}
        </MigrationMobileList>
      ) : (
        <MigrationList
          loading={loading}
          onSelectAllClick={onSelectAllBorrows}
          allSelected={allBorrowsSelected}
          isAvailable={isBorrowPositionsAvailable}
          isBottomOnMobile
          withBorrow
          totalAmount={totalBorrowsUSD}
          titleComponent={<Trans>Select v2 borrows to migrate</Trans>}
          numSelected={selectedBorrowAssets?.length || 0}
          numAvailable={borrowReserves?.length || 0}
        >
          {suppliesPositions}
        </MigrationList>
      )}
    </Box>
  );
};
