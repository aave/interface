import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

import { AppHeader } from './AppHeader';
import TopBarWarning from './TopBarWarning';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBarWarning />
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
    </>
  );
}
