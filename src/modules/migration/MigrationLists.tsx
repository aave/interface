import { Trans } from '@lingui/macro';
import { Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';
import {
  BorrowMigrationReserve,
  SupplyMigrationReserve,
} from 'src/hooks/migration/useUserMigrationReserves';
import { useRootStore } from 'src/store/root';
import { computeSelections, IsolatedReserve } from 'src/store/v3MigrationSelectors';

import { MigrationList } from './MigrationList';

interface MigrationListsProps {
  onSelectAllSupplies: () => void;
  onSelectAllBorrows: () => void;
  suppliesPositions: ReactNode;
  borrowsPositions: ReactNode;
  loading?: boolean;
  isSupplyPositionsAvailable: boolean;
  isBorrowPositionsAvailable: boolean;
  emodeCategoryId?: number;
  isolatedReserveV3?: IsolatedReserve;
  supplyReserves: SupplyMigrationReserve[];
  borrowReserves: BorrowMigrationReserve[];
}

export const MigrationLists = ({
  onSelectAllSupplies,
  onSelectAllBorrows,
  suppliesPositions,
  borrowsPositions,
  loading,
  isolatedReserveV3,
  isSupplyPositionsAvailable,
  isBorrowPositionsAvailable,
  emodeCategoryId,
  supplyReserves,
  borrowReserves,
}: MigrationListsProps) => {
  const {
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  const allSuppliesDisabled =
    supplyReserves.find((reserve) => reserve.migrationDisabled === undefined) === undefined;
  const allBorrowsDisabled =
    borrowReserves.find((reserve) => reserve.migrationDisabled === undefined) === undefined;

  const { activeSelections: activeSupplySelections, activeUnselected: activeSupplyUnselected } =
    computeSelections(supplyReserves, selectedSupplyAssets);
  const { activeSelections: activeBorrowSelections, activeUnselected: activeBorrowUnselected } =
    computeSelections(borrowReserves, selectedBorrowAssets);

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          p: {
            xs: '16px 24px 0 24px',
          },
          display: { xs: 'none', lg: 'block' },
        }}
      >
        Assets to migrate
      </Typography>
      <MigrationList
        isolatedReserveV3={isolatedReserveV3}
        loading={loading}
        onSelectAllClick={onSelectAllSupplies}
        allSelected={activeSupplyUnselected.length === 0}
        isAvailable={isSupplyPositionsAvailable}
        titleComponent={<Trans>Supplied assets</Trans>}
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
        titleComponent={<Trans>Borrowed assets</Trans>}
        numSelected={activeBorrowSelections.length || 0}
        numAvailable={borrowReserves.length || 0}
      >
        {borrowsPositions}
      </MigrationList>
    </Paper>
  );
};
