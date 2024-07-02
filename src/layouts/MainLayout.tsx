import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { FeedbackModal } from 'src/layouts/FeedbackDialog';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBarNotify
        learnMoreLink="https://governance.aave.com/t/arfc-gho-cross-chain-launch/17616"
        buttonText="Learn More"
        notifyText="Users can now bridge GHO to Arbitrum with CCIP ✨"
      />
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
