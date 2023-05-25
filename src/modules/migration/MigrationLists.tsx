import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import {
  computeSelections,
  MappedBorrowReserve,
  MappedSupplyReserves,
} from 'src/store/migrationFormatters';
import { useRootStore } from 'src/store/root';
import { IsolatedReserve } from 'src/store/v3MigrationSelectors';

import { MigrationList } from './MigrationList';

interface MigrationListsProps {
  onSelectAllSupplies: () => void;
  onSelectAllBorrows: () => void;
  suppliesPositions: ReactNode;
  borrowsPositions: ReactNode;
  loading?: boolean;
  emodeCategoryId?: number;
  isolatedReserveV3?: IsolatedReserve;
  supplyReserves: MappedSupplyReserves[];
  borrowReserves: MappedBorrowReserve[];
}

export const MigrationLists = ({
  onSelectAllSupplies,
  onSelectAllBorrows,
  suppliesPositions,
  borrowsPositions,
  loading,
  isolatedReserveV3,
  emodeCategoryId,
  supplyReserves,
  borrowReserves,
}: MigrationListsProps) => {
  const {
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  const isSupplyPositionsAvailable = supplyReserves.length > 0;
  const isBorrowPositionsAvailable = borrowReserves.length > 0;

  const allSuppliesDisabled =
    supplyReserves.find((reserve) => reserve.migrationDisabled === undefined) === undefined;
  const allBorrowsDisabled =
    borrowReserves.find((reserve) => reserve.migrationDisabled === undefined) === undefined;

  const { activeSelections: activeSupplySelections, activeUnselected: activeSupplyUnselected } =
    computeSelections(supplyReserves, selectedSupplyAssets);
  const { activeSelections: activeBorrowSelections, activeUnselected: activeBorrowUnselected } =
    computeSelections(borrowReserves, selectedBorrowAssets);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <MigrationList
        isolatedReserveV3={isolatedReserveV3}
        loading={loading}
        onSelectAllClick={onSelectAllSupplies}
        allSelected={activeSupplyUnselected.length === 0}
        isAvailable={isSupplyPositionsAvailable}
        titleComponent={<Trans>Select v2 supplies to migrate</Trans>}
        emodeCategoryId={emodeCategoryId}
        withCollateral
        disabled={allSuppliesDisabled}
        numSelected={activeSupplySelections.length || 0}
        numAvailable={supplyReserves.length || 0}
      >
        {suppliesPositions}
      </MigrationList>

      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllBorrows}
        allSelected={activeBorrowUnselected.length === 0}
        isAvailable={isBorrowPositionsAvailable}
        withBorrow
        disabled={allBorrowsDisabled}
        titleComponent={<Trans>Select v2 borrows to migrate</Trans>}
        numSelected={activeBorrowSelections.length || 0}
        numAvailable={borrowReserves.length || 0}
      >
        {borrowsPositions}
      </MigrationList>
    </Box>
  );
};
