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
        display: isDesktop ? 'flex' : 'block',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllSupplies}
        allSelected={allSuppliesSelected}
        isAvailable={isSupplyPositionsAvailable}
        titleComponent={<Trans>Select v2 supplies to migrate</Trans>}
        totalAmount={totalSuppliesUSD}
        withCollateral
        emodeCategoryId={emodeCategoryId}
      >
        {suppliesPositions}
      </MigrationList>

      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllBorrows}
        allSelected={allBorrowsSelected}
        isAvailable={isBorrowPositionsAvailable}
        isBottomOnMobile
        withBorrow
        titleComponent={<Trans>Select v2 borrows to migrate</Trans>}
        totalAmount={totalBorrowsUSD}
        // withEmode TODO: uncomment when emode logic for migration will fix
      >
        {borrowsPositions}
      </MigrationList>
    </Box>
  );
};
