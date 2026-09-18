import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { ReactNode, useMemo } from 'react';

import { buildP3Overrides, createAppTheme } from '../utils/theme';

/**
 * Main layout wrapper around the whole app. Provides the MUI theme via the CSS-variables
 * engine: both color schemes are baked into CSS custom properties once, and light/dark is
 * switched by toggling the `data-mui-color-scheme` attribute on <html> (persisted by MUI,
 * seeded from the OS preference). Components read/set the scheme via `useColorScheme()`.
 */
export function AppGlobalStyles({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createAppTheme(), []);

  // Display-P3 layer: on wide-gamut displays that support the syntax, override the sRGB
  // `--mui-palette-*` vars with their P3 equivalents. Everything else keeps the sRGB base.
  const p3Styles = useMemo(() => {
    const { light, dark } = buildP3Overrides(theme);
    return {
      '@supports (color: color(display-p3 1 1 1))': {
        '@media (color-gamut: p3)': {
          // Doubled selectors (specificity 0,2,0) beat MUI's own var sheets (0,1,0), so the
          // P3 layer wins regardless of stylesheet source order — and still match both <html>
          // and the showcase's local `data-mui-color-scheme` wrapper.
          ':root:root, [data-mui-color-scheme="light"][data-mui-color-scheme="light"]': light,
          '[data-mui-color-scheme="dark"][data-mui-color-scheme="dark"]': dark,
        },
      },
    };
  }, [theme]);

  return (
    <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline enableColorScheme />
      <GlobalStyles styles={p3Styles} />

      {children}
    </CssVarsProvider>
  );
}
