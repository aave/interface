import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { FeedbackModal } from 'src/layouts/FeedbackDialog';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

export function MainLayout({ children }: { children: ReactNode }) {
  // const currentMarket = useRootStore((state) => state.currentMarket);
  return (
    <>
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
      <AppFooter />
      <FeedbackModal />
      {FORK_ENABLED ? null : <AnalyticsConsent />}
    </>
  );
}
