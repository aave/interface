import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { NetworkConfig } from '../../ui-config/networksConfig';
import { BridgeButton } from '../BridgeButton';
import { MarketSwitcher } from '../MarketSwitcher';

export interface PageTitleProps extends Pick<NetworkConfig, 'bridge'> {
  pageTitle?: ReactNode;
  withMarketSwitcher?: boolean;
}

export const PageTitle = ({ pageTitle, withMarketSwitcher, bridge }: PageTitleProps) => {
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const upToMD = useMediaQuery(theme.breakpoints.up('md'));
  const downToXS = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xxs: 'flex-start', sm: 'center' },
        mb: pageTitle ? 4 : 0,
        flexDirection: { xxs: 'column', sm: 'row' },
      }}
    >
      {pageTitle && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography
            variant={downToXS ? 'h2' : upToLG ? 'display1' : 'h1'}
            sx={{ opacity: '0.7', mr: { xxs: 5, md: 3 }, mb: { xxs: 1, md: 0 } }}
          >
            {pageTitle}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        {withMarketSwitcher && <MarketSwitcher />}
        <BridgeButton bridge={bridge} variant="surface" withoutIcon={!upToMD} />
      </Box>
    </Box>
  );
};
