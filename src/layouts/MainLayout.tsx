import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import CookieConsent from 'src/components/cookies/CookieConsent';

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
      <CookieConsent />
    </>
  );
}
