import { Box, useTheme } from '@mui/material';
import ZeebuBG_dark from 'public/bg-dark.png';
import ZeebuBG_light from 'public/bg-light.png';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { FeedbackModal } from 'src/layouts/FeedbackDialog';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

export function MainLayout({ children }: { children: ReactNode }) {
  const APP_BANNER_VERSION = '3.0.0';
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundImage:
          theme.palette.mode === 'dark' ? `url(${ZeebuBG_dark.src})` : `url(${ZeebuBG_light.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
      }}
    >
      <TopBarNotify
        learnMoreLink="/markets/?marketName=proto_zksync_v3"
        buttonText="View Market"
        notifyText="Aave Governance has deployed a new ZkSync market"
        bannerVersion={APP_BANNER_VERSION}
        icon={'/icons/networks/zksync.svg'}
      />
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>

      <AppFooter />
      <FeedbackModal />
      {FORK_ENABLED ? null : <AnalyticsConsent />}
    </Box>
  );
}
