import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { useRootStore } from '../../store/root';
import { selectIsMigrationAvailable } from '../../store/v3MigrationSelectors';
import { NetworkConfig } from '../../ui-config/networksConfig';
// import { BridgeButton } from '../BridgeButton';
import { MarketSwitcher } from '../MarketSwitcher';
import { Link, ROUTES } from '../primitives/Link';

export interface PageTitleProps extends Pick<NetworkConfig, 'bridge'> {
  pageTitle?: ReactNode;
  withMarketSwitcher?: boolean;
  withMigrateButton?: boolean;
}

export const PageTitle = ({ pageTitle, withMarketSwitcher, withMigrateButton }: PageTitleProps) => {
  const isMigrateToV3Available = useRootStore((state) => selectIsMigrationAvailable(state));

  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  // const upToMD = useMediaQuery(theme.breakpoints.up('md'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        mb: pageTitle ? 4 : 0,
        flexDirection: { xs: 'column', xsm: 'row' },
      }}
    >
      {pageTitle && (downToXSM || !withMarketSwitcher) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography
            variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
            sx={{
              color: withMarketSwitcher ? 'text.muted' : 'text.primary',
              mr: { xs: 5, xsm: 3 },
              mb: { xs: 1, xsm: 0 },
            }}
          >
            {pageTitle}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: !pageTitle ? 4 : 0,
        }}
      >
        {withMarketSwitcher && <MarketSwitcher />}
        {/* <BridgeButton bridge={bridge} variant="surface" withoutIcon={!upToMD} /> */}
        {/* NOTE:// Removing for now  */}
        {isMigrateToV3Available && withMigrateButton && (
          <Link href={ROUTES.migrationTool} sx={{ mt: { xs: 2, xsm: 0 } }}>
            <Button variant="gradient" size="small">
              <Trans>Migrate to V3</Trans>
            </Button>
          </Link>
        )}
      </Box>
    </Box>
  );
};
