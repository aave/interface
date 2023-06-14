import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>

      <AppFooter />
      <AnalyticsConsent />
    </>
  );
}
