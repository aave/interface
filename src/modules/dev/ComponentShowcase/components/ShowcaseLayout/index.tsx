import { Box, Container, PaletteMode, Typography, useTheme } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ReactNode, useMemo, useState } from 'react';
import { Link } from 'src/components/primitives/Link';
import { createAppTheme } from 'src/utils/theme';

import { SHOWCASE_GROUPS } from '../../utils/registry';
import { ThemeControl } from '../ThemeControl';

interface ShowcaseLayoutProps {
  activeSlug: string;
  children: ReactNode;
}

export const ShowcaseLayout = ({ activeSlug, children }: ShowcaseLayoutProps) => {
  const appTheme = useTheme();
  // The showcase runs on its OWN theme so switching it here doesn't flip the whole app.
  // Seed from the app's current mode.
  const [mode, setMode] = useState<PaletteMode>(appTheme.palette.mode);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={(t) => ({
          display: 'flex',
          minHeight: '100vh',
          // The showcase uses a local theme with no CssBaseline of its own, so set the
          // inherited text color here — otherwise plain <Typography> inherits the app
          // body color and won't follow the showcase's Light/Dark control.
          color: t.palette.text.primary,
          backgroundColor: t.palette.fig['bg-2'],
        })}
      >
        {/* Sidebar */}
        <Box
          component="nav"
          sx={(t) => ({
            width: 248,
            flexShrink: 0,
            borderRight: `1px solid ${t.palette.divider}`,
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
            height: '100vh',
            overflowY: 'auto',
            p: 4,
          })}
        >
          <Typography variant="main16" sx={{ display: 'block', px: 2, mb: 5 }}>
            Components
          </Typography>

          {SHOWCASE_GROUPS.map((group, index) => (
            <Box key={group.label}>
              <Typography
                variant="helperText"
                sx={(t) => ({
                  display: 'block',
                  px: 2,
                  mt: index === 0 ? 0 : 5,
                  mb: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: t.palette.text.muted,
                })}
              >
                {group.label}
              </Typography>

              {group.sections.map((section) => {
                const active = section.slug === activeSlug;
                return (
                  <Link
                    key={section.slug}
                    href={`/dev/components/${section.slug}`}
                    variant="buttonM"
                    sx={(t) => ({
                      display: 'block',
                      py: 1,
                      px: 2,
                      borderRadius: '8px',
                      color: active ? t.palette.text.primary : t.palette.text.secondary,
                      backgroundColor: active ? t.palette.fig.selected : 'transparent',
                      '&:hover': {
                        color: t.palette.text.primary,
                        backgroundColor: active
                          ? t.palette.fig.selected
                          : t.palette.fig['button-hover'],
                      },
                    })}
                  >
                    {section.label}
                  </Link>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={(t) => ({
              position: 'sticky',
              top: 0,
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,
              px: 8,
              py: 3,
              borderBottom: `1px solid ${t.palette.divider}`,
              backgroundColor: t.palette.fig['bg-2'],
            })}
          >
            <Typography variant="main14" color="text.secondary">
              Component showcase
            </Typography>
            <ThemeControl mode={mode} onChange={setMode} />
          </Box>

          <Container maxWidth="lg" sx={{ py: 10 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
