import React, { ReactNode } from 'react';

import { MarketSwitcher } from '../components/MarketSwitcher';
import { AppHeader } from './AppHeader';

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

      <MarketSwitcher />
    </>
  );
}
