import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

import LanguageSelector from '../components/LanguageSelector';
import AppHeader from './AppHeader';

export const HeaderTopLineHeightContext = React.createContext({
  headerTopLineHeight: 248,
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  setHeaderTopLineHeight: (_headerTopLineHeight: number) => {},
});

export function useHeaderTopLineHeight(headerTopLineHeight: number) {
  const { setHeaderTopLineHeight } = React.useContext(HeaderTopLineHeightContext);
  React.useEffect(() => setHeaderTopLineHeight(headerTopLineHeight));
}

export default function MainLayout({ children }: { children: ReactNode }) {
  const [headerTopLineHeight, setHeaderTopLineHeight] = React.useState(248);

  return (
    <>
      <AppHeader topLineHeight={headerTopLineHeight} />

      <main>
        <HeaderTopLineHeightContext.Provider
          value={{ headerTopLineHeight, setHeaderTopLineHeight }}
        >
          {children}
        </HeaderTopLineHeightContext.Provider>
      </main>

      <Box sx={{ width: 150, margin: '0 auto' }}>
        <LanguageSelector />
      </Box>
    </>
  );
}
