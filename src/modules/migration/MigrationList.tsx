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

interface MigrationListProps {
  titleComponent: ReactNode;
  isBottomOnMobile?: boolean;
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
  isBottomOnMobile,
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

  const isDesktop = useMediaQuery(theme.breakpoints.up('xl'));
  const isMobile = useMediaQuery(theme.breakpoints.down(655));

  const assetColumnWidth = isDesktop ? 120 : 80;

  const paperWidth = isDesktop ? 'calc(50% - 8px)' : '100%';

  if (isMobile) {
    return (
      <MigrationMobileList
        titleComponent={titleComponent}
        isBottomOnMobile={isBottomOnMobile}
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
    <Box sx={{ width: paperWidth, mt: { xs: isBottomOnMobile ? 2 : 0, xl: 0 } }}>
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

            <ListColumn isRow maxWidth={assetColumnWidth} minWidth={assetColumnWidth}>
              <ListHeaderTitle>
                <Trans>Assets</Trans>
              </ListHeaderTitle>
            </ListColumn>

            {withCollateral && (
              <>
                <ListColumn align="right">
                  <ListHeaderTitle>
                    <Trans>Collateral change</Trans>
                  </ListHeaderTitle>
                </ListColumn>

                <ListColumn align="right">
                  <ListHeaderTitle>
                    <Trans>Max LTV</Trans>
                  </ListHeaderTitle>
                </ListColumn>
              </>
            )}

            <ListColumn align="right">
              <ListHeaderTitle>
                <Trans>APY change</Trans>
              </ListHeaderTitle>
            </ListColumn>

            {withBorrow && (
              <>
                <ListColumn align="right">
                  <ListHeaderTitle>
                    <Trans>APY type change</Trans>
                  </ListHeaderTitle>
                </ListColumn>

                <ListColumn align="right">
                  <ListHeaderTitle>
                    <Trans>Liquidation Threshold</Trans>
                  </ListHeaderTitle>
                </ListColumn>
              </>
            )}

            <ListColumn align="right" maxWidth={150} minWidth={150}>
              <ListHeaderTitle>
                <Trans>Current v2 balance</Trans>
              </ListHeaderTitle>
            </ListColumn>
          </ListHeaderWrapper>
        )}

        {children}
      </ListWrapper>
    </Box>
  );
};
