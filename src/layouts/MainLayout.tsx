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
      {currentMarket === 'proto_mainnet' ||
      currentMarket === 'proto_avalanche_v3' ||
      currentMarket === 'proto_polygon_v3' ||
      currentMarket === 'proto_optimism_v3' ? (
        <TopBarNotify
          learnMoreLink="https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335"
          notifyText="Affected Aave V3 markets have been unpaused by the Community Guardian following governance proposal execution"
        />
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
