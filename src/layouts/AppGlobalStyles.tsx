import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import { getDesignTokens, getThemedComponents } from '../utils/theme';

export const ColorModeContext = React.createContext({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleColorMode: () => {},
});

type Mode = 'light' | 'dark';

/**
 * Main Layout component which wraps around the whole app
 * @param param0
 * @returns
 */
export function AppGlobalStyles({ children }: { children: ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<Mode>(prefersDarkMode ? 'dark' : 'light');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('colorMode', newMode);
          return newMode;
        });
      },
    }),
    []
  );

  useEffect(() => {
    const initialMode = localStorage?.getItem('colorMode') as Mode;
    if (initialMode) {
      setMode(initialMode);
    } else if (prefersDarkMode) {
      setMode('dark');
    }
  }, []);

  const theme = useMemo(() => {
    const themeCreate = createTheme(getDesignTokens(mode));
    return deepmerge(themeCreate, getThemedComponents(themeCreate));
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />

        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
