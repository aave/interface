import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { MigrationList } from './MigrationList';

interface MigrationListsProps {
  totalSuppliesUSD: string;
  totalBorrowsUSD: string;
  onSelectAllSupplies: () => void;
  onSelectAllBorrows: () => void;
  suppliesPositions: ReactNode;
  borrowsPositions: ReactNode;
}

export const MigrationLists = ({
  totalSuppliesUSD,
  totalBorrowsUSD,
  onSelectAllSupplies,
  onSelectAllBorrows,
  suppliesPositions,
  borrowsPositions,
}: MigrationListsProps) => {
  const { breakpoints } = useTheme();
  const isTablet = useMediaQuery(breakpoints.up('md'));

  return (
    <Box
      sx={{
        display: isTablet ? 'flex' : 'block',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <MigrationList
        onSelectAllClick={onSelectAllSupplies}
        titleComponent={
          <Box sx={{ display: 'flex' }}>
            <Typography variant="h2" sx={{ mr: 4 }}>
              <Trans>Your supplies</Trans>
            </Typography>
            <FormattedNumber value={totalSuppliesUSD} symbol="USD" />
          </Box>
        }
      >
        {suppliesPositions}
      </MigrationList>

      <MigrationList
        onSelectAllClick={onSelectAllBorrows}
        isBottomOnMobile
        titleComponent={
          <Box sx={{ display: 'flex' }}>
            <Typography variant="h2" sx={{ mr: 4 }}>
              <Trans>Your borrows</Trans>
            </Typography>
            <FormattedNumber value={totalBorrowsUSD} symbol="USD" />
          </Box>
        }
      >
        {borrowsPositions}
      </MigrationList>
    </Box>
  );
};
