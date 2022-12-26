import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { CollateralSwitchTooltip } from 'src/components/infoTooltips/CollateralSwitchTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { ListTopInfoItem } from 'src/modules/dashboard/lists/ListTopInfoItem';

import { EmodeInfo } from './EmodeInfo';

interface MigrationListProps {
  titleComponent: ReactNode;
  totalAmount: string;
  isBottomOnMobile?: boolean;
  children: ReactNode;
  onSelectAllClick: () => void;
  loading?: boolean;
  isAvailable: boolean;
  withCollateral?: boolean;
  emodeCategoryId?: number;
}

export const MigrationList = ({
  titleComponent,
  totalAmount,
  isBottomOnMobile,
  children,
  onSelectAllClick,
  loading,
  isAvailable,
  withCollateral,
  emodeCategoryId,
}: MigrationListProps) => {
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const isTablet = useMediaQuery(breakpoints.up('xsm'));
  const isMobile = useMediaQuery(breakpoints.up('xs'));

  const assetColumnWidth =
    isMobile && !isTablet ? 75 : isTablet && !isDesktop ? 140 : isDesktop ? 240 : 140;

  const paperWidth = isDesktop ? 'calc(50% - 8px)' : '100%';

  return (
    <Box sx={{ width: paperWidth, mt: { xs: isBottomOnMobile ? 2 : 0, lg: 0 } }}>
      <ListWrapper
        titleComponent={
          <Typography component="div" variant="h3" sx={{ mr: 4 }}>
            {titleComponent}
          </Typography>
        }
        subTitleComponent={
          typeof emodeCategoryId !== 'undefined' ? (
            <EmodeInfo userEmodeCategoryId={emodeCategoryId} />
          ) : undefined
        }
        topInfo={
          !(loading || +totalAmount <= 0) && (
            <ListTopInfoItem title={<Trans>Balance</Trans>} value={totalAmount || 0} />
          )
        }
      >
        {(isAvailable || loading) && (
          <ListHeaderWrapper>
            <ListColumn align="center" maxWidth={isDesktop ? 100 : 60} minWidth={60}>
              <ListHeaderTitle onClick={onSelectAllClick}>
                <Typography variant="main12" sx={{ fontWeight: 700 }}>
                  <Trans>Select all</Trans>
                </Typography>
              </ListHeaderTitle>
            </ListColumn>

            <ListColumn isRow maxWidth={assetColumnWidth} minWidth={assetColumnWidth}>
              <ListHeaderTitle>
                <Trans>Asset</Trans>
              </ListHeaderTitle>
            </ListColumn>

            {withCollateral && (
              <ListColumn align="center">
                <CollateralSwitchTooltip
                  text={<Trans>Collateral</Trans>}
                  key="Collateral"
                  variant="subheader2"
                />
              </ListColumn>
            )}

            <ListColumn align="right">
              <ListHeaderTitle>
                <Trans>Current balance</Trans>
              </ListHeaderTitle>
            </ListColumn>
          </ListHeaderWrapper>
        )}

        {children}
      </ListWrapper>
    </Box>
  );
};
