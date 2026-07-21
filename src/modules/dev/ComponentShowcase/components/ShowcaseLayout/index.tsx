import { Box, Container, PaletteMode, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { ReactNode, useState } from 'react';
import { Link } from 'src/components/primitives/Link';

import { SHOWCASE_GROUPS } from '../../utils/registry';
import { ThemeControl } from '../ThemeControl';

interface ShowcaseLayoutProps {
  activeSlug: string;
  children: ReactNode;
}

export const ShowcaseLayout = ({ activeSlug, children }: ShowcaseLayoutProps) => {
  const { mode: appMode, systemMode } = useColorScheme();

  // The showcase runs on its OWN color scheme (seeded once from the app's) so switching it
  // here re-declares the CSS variables for this subtree only — via the `data-mui-color-scheme`
  // attribute — without flipping the whole app. Colors below use `sx` palette shortcuts,
  // which resolve to CSS-var refs and therefore follow that attribute. (`fig` tokens are
  // reached through their semantic aliases: bg-2 → background.surface, selected →
  // action.selected, button-hover → action.hover.)
  const [scheme, setScheme] = useState<PaletteMode>(
    () => (appMode === 'system' ? systemMode : appMode) ?? 'light'
  );

  return (
    <Box
      data-mui-color-scheme={scheme}
      sx={{
        display: 'flex',
        minHeight: '100vh',
        color: 'fg-1',
        bgcolor: 'bg-2',
      }}
    >
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 248,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'border-2',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          overflowY: 'auto',
          p: 4,
        }}
      >
        <Typography variant="main16" sx={{ display: 'block', px: 2, mb: 5 }}>
          Components
        </Typography>

        {SHOWCASE_GROUPS.map((group, index) => (
          <Box key={group.label}>
            <Typography
              variant="helperText"
              sx={{
                display: 'block',
                px: 2,
                mt: index === 0 ? 0 : 5,
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'fg-3',
              }}
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
                  sx={{
                    display: 'block',
                    py: 1,
                    px: 2,
                    borderRadius: '8px',
                    color: active ? 'fg-1' : 'fg-2',
                    backgroundColor: active ? 'selected' : 'transparent',
                    '&:hover': {
                      color: 'fg-1',
                      backgroundColor: active ? 'selected' : 'button-hover',
                    },
                  }}
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
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 4,
            px: 8,
            py: 3,
            borderBottom: '1px solid',
            borderColor: 'border-2',
            bgcolor: 'bg-2',
          }}
        >
          <Typography variant="main14" color="fg-2">
            Component showcase
          </Typography>
          <ThemeControl mode={scheme} onChange={setScheme} />
        </Box>

        <Container maxWidth="lg" sx={{ py: 10 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
