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

  const notifyText =
    'An issue in a certain feature of the Aave Protocol was identified. Some markets or assets are temporarily paused. No funds are at risk.';

  const unPauseText =
    'Affected Aave V3 markets have been unpaused by the Community Guardian following governance proposal execution."';

  return (
    <>
      {currentMarket === 'proto_mainnet' ||
      currentMarket === 'proto_avalanche_v3' ||
      currentMarket === 'proto_polygon_v3' ||
      currentMarket === 'proto_optimism_v3' ? (
        <TopBarNotify
          learnMoreLink="https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335"
          notifyText={currentMarket === 'proto_mainnet' ? notifyText : unPauseText}
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
