import CssBaseline from '@mui/material/CssBaseline';
import React, { ReactNode } from 'react';
import ThemeProvider from 'src/libs/materialUI';

export const ColorModeContext = React.createContext({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleColorMode: () => {},
});

/**
 * Main Layout component which wrapps around the whole app
 * @param param0
 * @returns
 */
export function AppGlobalStyles({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CssBaseline />

      {children}
    </ThemeProvider>
  );
}
