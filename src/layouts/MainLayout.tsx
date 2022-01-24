import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

import LanguageSelector from '../components/LanguageSelector';
import { MarketSwitcher } from '../components/MarketSwitcher';
import AppHeader from './AppHeader';

export default function MainLayout({
  children,
  headerTopLineHeight = 248,
}: {
  children: ReactNode;
  headerTopLineHeight?: number;
}) {
  return (
    <>
      <AppHeader topLineHeight={headerTopLineHeight} />

      <main>{children}</main>

      <Box sx={{ width: 150, margin: '0 auto' }}>
        <LanguageSelector />
      </Box>

      <MarketSwitcher />
    </>
  );
}
