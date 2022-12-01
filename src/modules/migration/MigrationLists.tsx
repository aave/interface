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

  const valueFontSize = isTablet ? 'h4' : 'subheader1';

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
        isAvailable={isSupplyPositionsAvailable}
        titleComponent={
          <Box sx={{ display: 'flex' }}>
            <Typography variant={isTablet ? 'h2' : 'h3'} sx={{ mr: 6 }}>
              <Trans>Your supplies</Trans>
            </Typography>
            {!(loading || +totalSuppliesUSD <= 0) && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormattedNumber value={totalSuppliesUSD} variant={valueFontSize} />
                <Typography variant={valueFontSize} color="text.secondary" sx={{ ml: 1 }}>
                  USD
                </Typography>
              </Box>
            )}
          </Box>
        }
      >
        {suppliesPositions}
      </MigrationList>

      <MigrationList
        loading={loading}
        onSelectAllClick={onSelectAllBorrows}
        isAvailable={isBorrowPositionsAvailable}
        isBottomOnMobile
        titleComponent={
          <Box sx={{ display: 'flex' }}>
            <Typography variant={isTablet ? 'h2' : 'h3'} sx={{ mr: 6 }}>
              <Trans>Your borrows</Trans>
            </Typography>
            {!(loading || +totalBorrowsUSD <= 0) && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormattedNumber value={totalBorrowsUSD} variant={valueFontSize} />
                <Typography variant={valueFontSize} color="text.secondary" sx={{ ml: 1 }}>
                  USD
                </Typography>
              </Box>
            )}
          </Box>
        }
      >
        {borrowsPositions}
      </MigrationList>
    </Box>
  );
};
