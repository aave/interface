import React, { ReactNode } from 'react';

import { AppHeader } from './AppHeader';
import { Box } from '@mui/material';

export function MainLayout({
  children,
  headerTopLineHeight = 296,
}: {
  children: ReactNode;
  headerTopLineHeight?: number;
}) {
  return (
    <>
      <AppHeader topLineHeight={headerTopLineHeight} />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
    </>
  );
}
