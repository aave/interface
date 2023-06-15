import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

export function MainLayout({ children }: { children: ReactNode }) {
  console.log('FORK_ENABLED', FORK_ENABLED);
  const { currentMarket } = useProtocolDataContext();

  console.log('currentMarket', currentMarket);

  return (
    <>
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>

      <AppFooter />
      {FORK_ENABLED ? null : <AnalyticsConsent />}
    </>
  );
}
