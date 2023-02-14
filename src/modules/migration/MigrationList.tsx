import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { useRootStore } from 'src/store/root';
import { IsolatedReserve } from 'src/store/v3MigrationSelectors';

import { MigrationMobileList } from './MigrationMobileList';
import { MigrationSelectionBox } from './MigrationSelectionBox';

const supplyListHeaders = [
  { title: <Trans>APY change</Trans> },
  { title: <Trans>Collateral change</Trans> },
  { title: <Trans>Max LTV</Trans> },
  { title: <Trans>Current v2 balance</Trans> },
];

const borrowListHeaders = [
  { title: <Trans>APY change</Trans> },
  { title: <Trans>APY type change</Trans> },
  { title: <Trans>Liquidation Threshold</Trans> },
  { title: <Trans>Current v2 balance</Trans> },
];

interface MigrationListProps {
  titleComponent: ReactNode;
  children: ReactNode;
  onSelectAllClick: () => void;
  loading?: boolean;
  isAvailable: boolean;
  withCollateral?: boolean;
  withBorrow?: boolean;
  emodeCategoryId?: number;
  allSelected: boolean;
  numSelected: number;
  numAvailable: number;
  disabled: boolean;
  isolatedReserveV3?: IsolatedReserve;
}

export const MigrationList = ({
  titleComponent,
  children,
  onSelectAllClick,
  loading,
  isAvailable,
  withCollateral,
  withBorrow,
  allSelected,
  numSelected,
  numAvailable,
  disabled,
  isolatedReserveV3,
}: MigrationListProps) => {
  const theme = useTheme();
  const { currentMarket, currentMarketData } = useRootStore();
  const marketName = currentMarketData.marketTitle;
  const marketLink = ROUTES.dashboard + '/?marketName=' + currentMarket + '_v3';

  const isMobile = useMediaQuery(theme.breakpoints.down(1125));
  if (isMobile) {
    return (
      <MigrationMobileList
        titleComponent={titleComponent}
        onSelectAllClick={onSelectAllClick}
        loading={loading}
        isAvailable={isAvailable}
        allSelected={allSelected}
        numSelected={numSelected}
        disabled={disabled}
        numAvailable={numAvailable}
      >
        {children}
      </MigrationMobileList>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <ListWrapper
        titleComponent={
          <Box display="block">
            <Typography component="div" variant="h3" sx={{ mr: 4 }}>
              {titleComponent}
            </Typography>
            {isolatedReserveV3 && !isolatedReserveV3.enteringIsolationMode && (
              <Box sx={{ pt: '16px' }}>
                <Warning severity="warning" icon={false} sx={{ mb: 0 }}>
                  <Typography variant="caption" color={theme.palette.warning[100]}>
                    <Trans>
                      Some migrated assets will not be used as collateral due to enabled isolation
                      mode in {marketName} V3 Market. Visit{' '}
                      <Link href={marketLink}>{marketName} V3 Dashboard</Link> to manage isolation
                      mode.
                    </Trans>
                  </Typography>
                </Warning>
              </Box>
            )}
          </Box>
        }
      >
        {(isAvailable || loading) && (
          <ListHeaderWrapper sx={{ pl: 0 }}>
            <ListColumn align="center" maxWidth={64} minWidth={64}>
              <MigrationSelectionBox
                allSelected={allSelected}
                numSelected={numSelected}
                onSelectAllClick={onSelectAllClick}
                disabled={disabled}
              />
            </ListColumn>

            <ListColumn isRow maxWidth={250} minWidth={170}>
              <ListHeaderTitle>
                <Trans>Assets</Trans>
              </ListHeaderTitle>
            </ListColumn>

            {withCollateral &&
              supplyListHeaders.map((header, index) => (
                <ListColumn key={index}>
                  <ListHeaderTitle>{header.title}</ListHeaderTitle>
                </ListColumn>
              ))}

            {withBorrow &&
              borrowListHeaders.map((header, index) => (
                <ListColumn key={index}>
                  <ListHeaderTitle>{header.title}</ListHeaderTitle>
                </ListColumn>
              ))}
          </ListHeaderWrapper>
        )}

        {children}
      </ListWrapper>
    </Box>
  );
};
