import { MenuIcon } from '@heroicons/react/outline';
import {
  Box,
  Container,
  Drawer,
  IconButton,
  PaletteMode,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { ReactNode, useState } from 'react';
import { Link } from 'src/components/primitives/Link';

import { SHOWCASE_GROUPS, SHOWCASE_SECTIONS } from '../../utils/registry';
import { ThemeControl } from '../ThemeControl';

interface ShowcaseLayoutProps {
  activeSlug: string;
  children: ReactNode;
}

const SIDEBAR_WIDTH = 248;

export const ShowcaseLayout = ({ activeSlug, children }: ShowcaseLayoutProps) => {
  const { mode: appMode, systemMode } = useColorScheme();

  // The showcase runs on its OWN color scheme (seeded once from the app's) so switching it
  // here re-declares the CSS variables for this subtree only — via the `data-mui-color-scheme`
  // attribute — without flipping the whole app. Colors below use `sx` palette shortcuts,
  // which resolve to CSS-var refs and therefore follow that attribute.
  const [scheme, setScheme] = useState<PaletteMode>(
    () => (appMode === 'system' ? systemMode : appMode) ?? 'light'
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Some sections (page-wide banners) opt out of the max-width content container.
  const fullBleed = SHOWCASE_SECTIONS.find((s) => s.slug === activeSlug)?.fullBleed ?? false;

  // One nav block, reused by the desktop sidebar and the mobile drawer.
  const nav = (
    <>
      <Typography variant="h4" sx={{ display: 'block', px: 2, mb: 5 }}>
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
                onClick={() => setMobileNavOpen(false)}
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
    </>
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
      {/* Persistent sidebar (md and up) */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'border-2',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          overflowY: 'auto',
          p: 4,
          display: { xs: 'none', md: 'block' },
        }}
      >
        {nav}
      </Box>

      {/* Mobile drawer (below md). It portals to <body>, outside the local-scheme wrapper above,
          so the inner Box re-declares `data-mui-color-scheme` to keep it on the showcase theme. */}
      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{ sx: { width: SIDEBAR_WIDTH, border: 'none' } }}
      >
        <Box
          data-mui-color-scheme={scheme}
          sx={{ height: '100%', p: 4, overflowY: 'auto', bgcolor: 'bg-2', color: 'fg-1' }}
        >
          {nav}
        </Box>
      </Drawer>

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
            px: { xs: 4, md: 8 },
            py: 3,
            borderBottom: '1px solid',
            borderColor: 'border-2',
            bgcolor: 'bg-2',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            <IconButton
              aria-label="open navigation"
              onClick={() => setMobileNavOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, ml: -1 }}
            >
              <SvgIcon sx={{ fontSize: 22, color: 'fg-2' }}>
                <MenuIcon />
              </SvgIcon>
            </IconButton>
            <Typography
              variant="subheader1"
              color="fg-2"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Component showcase
            </Typography>
          </Box>
          <ThemeControl mode={scheme} onChange={setScheme} />
        </Box>

        <Container maxWidth={fullBleed ? false : 'lg'} sx={{ py: { xs: 6, md: 10 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
