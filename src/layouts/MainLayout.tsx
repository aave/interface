import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import TopBarNotify from 'src/layouts/TopBarNotify';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

export function MainLayout({ children }: { children: ReactNode }) {
  const { currentMarket } = useProtocolDataContext();

  return (
    <>
      {currentMarket === 'proto_mainnet' || currentMarket === 'proto_avalanche_v3' ? (
        <TopBarNotify notifyText="An issue in a certain feature of the Aave Protocol was identified. Some markets or assets are temporarily paused. No funds are at risk." />
      ) : null}

      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>

      <AppFooter />
      {FORK_ENABLED ? null : <AnalyticsConsent />}
    </>
  );
}
