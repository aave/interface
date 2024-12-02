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
        learnMoreLink="https://oh7vm38ynd2.typeform.com/to/Fnw3rMyw"
        notifyText="Looking to provide feedback? We'd love to hear from you! 👉"
        bannerVersion={APP_BANNER_VERSION}
        buttonText="Share feedback"
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
