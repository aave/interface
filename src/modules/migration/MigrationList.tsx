import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { ListTopInfoItem } from 'src/modules/dashboard/lists/ListTopInfoItem';

interface MigrationListProps {
  titleComponent: ReactNode;
  totalAmount: string;
  isBottomOnMobile?: boolean;
  children: ReactNode;
  onSelectAllClick: () => void;
  loading?: boolean;
  isAvailable: boolean;
}

export const MigrationList = ({
  titleComponent,
  totalAmount,
  isBottomOnMobile,
  children,
  onSelectAllClick,
  loading,
  isAvailable,
}: MigrationListProps) => {
  const { breakpoints } = useTheme();
  const isTablet = useMediaQuery(breakpoints.up('md'));
  const paperWidth = isTablet ? 'calc(50% - 8px)' : '100%';

  return (
    <Box sx={{ width: paperWidth, mt: { xs: isBottomOnMobile ? 2 : 0, md: 0 } }}>
      <ListWrapper
        titleComponent={
          <Typography component="div" variant="h3" sx={{ mr: 4 }}>
            {titleComponent}
          </Typography>
        }
        topInfo={
          !(loading || +totalAmount <= 0) && (
            <ListTopInfoItem title={<Trans>Balance</Trans>} value={totalAmount || 0} />
          )
        }
      >
        {(isAvailable || loading) && (
          <ListHeaderWrapper>
            <ListColumn align="center" maxWidth={isTablet ? 100 : 60}>
              <ListHeaderTitle onClick={onSelectAllClick}>
                <Typography variant="main12" sx={{ fontWeight: 700 }}>
                  <Trans>Select all</Trans>
                </Typography>
              </ListHeaderTitle>
            </ListColumn>

            <ListColumn isRow maxWidth={280}>
              <ListHeaderTitle>
                <Trans>Asset</Trans>
              </ListHeaderTitle>
            </ListColumn>

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
