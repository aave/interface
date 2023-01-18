import { Trans } from '@lingui/macro';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode, useCallback } from 'react';
import { useRootStore } from 'src/store/root';
import { computeSelections, selectUserReservesForMigration } from 'src/store/v3MigrationSelectors';

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
  const isDesktop = useMediaQuery(breakpoints.up('xl'));

  const {
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  const { supplyReserves, borrowReserves } = useRootStore(
    useCallback((state) => selectUserReservesForMigration(state, 0), [])
  );

  const allSuppliesDisabled =
    supplyReserves.find((reserve) => !!reserve.migrationDisabled) !== undefined;
  const allBorrowsDisabled =
    borrowReserves.find((reserve) => !!reserve.migrationDisabled) !== undefined;

  const { activeSelections: activeSupplySelections, activeUnselected: activeSupplyUnselected } =
    computeSelections(supplyReserves, selectedSupplyAssets);
  const { activeSelections: activeBorrowSelections, activeUnselected: activeBorrowUnselected } =
    computeSelections(borrowReserves, selectedBorrowAssets);

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
        allSelected={activeSupplyUnselected.length === 0}
        isAvailable={isSupplyPositionsAvailable}
        titleComponent={<Trans>Select v2 supplies to migrate</Trans>}
        emodeCategoryId={emodeCategoryId}
        withCollateral
        disabled={allSuppliesDisabled}
        totalAmount={totalSuppliesUSD}
        numSelected={activeSupplySelections.length || 0}
        numAvailable={activeSupplyUnselected.length || 0}
      >
        {suppliesPositions}
      </MigrationList>

      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllBorrows}
        allSelected={activeBorrowUnselected.length === 0}
        isAvailable={isBorrowPositionsAvailable}
        isBottomOnMobile
        withBorrow
        disabled={allBorrowsDisabled}
        totalAmount={totalBorrowsUSD}
        titleComponent={<Trans>Select v2 borrows to migrate</Trans>}
        numSelected={activeBorrowSelections.length || 0}
        numAvailable={activeBorrowUnselected.length || 0}
      >
        {borrowsPositions}
      </MigrationList>
    </Box>
  );
};
