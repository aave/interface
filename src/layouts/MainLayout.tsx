import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { FeedbackModal } from 'src/layouts/FeedbackDialog';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

export function MainLayout({ children }: { children: ReactNode }) {
  const APP_BANNER_VERSION = '4.0.0';

  return (
    <>
      <TopBarNotify
        learnMoreLink="/markets/?marketName=proto_mainnet_v3"
        notifyText="New merit incentives are now available for supplying cbBTC and borrowing USDC (both required)"
        bannerVersion={APP_BANNER_VERSION}
        // icon={'/icons/networks/zksync.svg'}
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
