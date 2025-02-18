import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { FeedbackModal } from 'src/layouts/FeedbackDialog';
import { useRootStore } from 'src/store/root';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

const SwitchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    style={{ marginLeft: '8px', width: '24px', height: '24px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
    />
  </svg>
);
export function MainLayout({ children }: { children: ReactNode }) {
  const APP_BANNER_VERSION = '6.0.0';
  const currentMarket = useRootStore((state) => state.currentMarket);
  return (
    <>
      {currentMarket === 'proto_base_v3' && (
        <TopBarNotify
          // learnMoreLink="https://oh7vm38ynd2.typeform.com/to/Fnw3rMyw"
          notifyText="Swap debt to GHO, now live on Base!"
          bannerVersion={APP_BANNER_VERSION}
          customIcon={<SwitchIcon />}
        />
      )}

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
