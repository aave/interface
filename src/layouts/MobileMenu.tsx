import { Trans } from '@lingui/macro';
import { Box, Button, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { BridgeIcon } from 'src/components/icons/BridgeIcon';
import { SwapIcon } from 'src/components/icons/SwapIcon';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { figVars } from 'src/utils/figmaColors';
import { isFeatureEnabled, PROD_ENV } from 'src/utils/marketsAndNetworksConfig';

import { DarkModeSwitcher } from './components/DarkModeSwitcher';
import { DrawerWrapper } from './components/DrawerWrapper';
import { LanguageListItem, LanguagesList } from './components/LanguageSwitcher';
import { NavItems } from './components/NavItems';
import { ShieldSwitcher } from './components/ShieldSwitcher';
import { TestNetModeSwitcher } from './components/TestNetModeSwitcher';

interface MobileMenuProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  headerHeight: number;
}

// The options scroll area: full-width so its scrollbar sits on the right edge, with 0.75rem inner
// padding for the content.
const scrollAreaSx = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  px: '0.75rem',
  pb: '3rem',
} as const;

// Rows inside the drawer lists: 3rem tall, H3 label text, gutters zeroed so they align with the
// scroll area's 0.75rem inset. Applied via sx so the shared row components (SettingSwitchRow,
// LanguagesList) don't need to know about it.
const menuListSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  '& .MuiListItem-root': {
    minHeight: '3rem',
    borderRadius: '0.5rem',
    px: 0,
    cursor: 'pointer',
  },
  '& .MuiListItemText-primary': { fontSize: '1.125rem', fontWeight: 500, lineHeight: '120%' },
};

// The hamburger (three rounded lines, per the design SVG) that morphs into an X. Rendered inside
// one fixed-size button (below), so toggling never resizes the button and shifts the header.
// One bar of the hamburger; the three uses below add position + the open-state transform.
const toggleBar = {
  position: 'absolute' as const,
  left: '4px',
  width: '16px',
  height: '2px',
  borderRadius: '1px',
  backgroundColor: 'currentColor',
  transition: 'transform 0.2s ease, opacity 0.2s ease',
};

const MenuToggleIcon = ({ open }: { open: boolean }) => (
  <Box sx={{ position: 'relative', width: 24, height: 24, color: 'fg-2' }}>
    <Box
      sx={{ ...toggleBar, top: '5px', transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }}
    />
    <Box sx={{ ...toggleBar, top: '11px', opacity: open ? 0 : 1 }} />
    <Box
      sx={{
        ...toggleBar,
        top: '17px',
        transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none',
      }}
    />
  </Box>
);

export const MobileMenu = ({ open, setOpen, headerHeight }: MobileMenuProps) => {
  const [isLanguagesListOpen, setIsLanguagesListOpen] = useState(false);
  // Drives the top scrim: it only shows once the options actually scroll, so it never dims the
  // first row at rest.
  const [scrolled, setScrolled] = useState(false);
  const { openReadMode, openSwitch, openBridge } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const showSwitchButton = isFeatureEnabled.switch(currentMarketData);

  useEffect(() => setIsLanguagesListOpen(false), [open]);
  // A fresh scroll area always starts at the top, so reset on open / view switch.
  useEffect(() => setScrolled(false), [open, isLanguagesListOpen]);

  const handleOpenReadMode = () => {
    setOpen(false);
    openReadMode();
  };

  const handleSwap = () => {
    setOpen(false);
    openSwitch();
  };

  const handleBridge = () => {
    setOpen(false);
    openBridge();
  };

  return (
    <>
      <Button
        id="settings-button-mobile"
        variant="outlined"
        aria-label="menu"
        aria-pressed={open}
        sx={{ p: '7px 8px', minWidth: 'unset', ml: 2 }}
        onClick={() => setOpen(!open)}
      >
        <MenuToggleIcon open={open} />
      </Button>

      <DrawerWrapper open={open} setOpen={setOpen} headerHeight={headerHeight}>
        {/* Fade scrim over the top of the scroll area (mirrors the bottom scrim). Only shown once
            scrolled, so it never dims the first row at rest. Inset from the top by the drawer's
            padding (clean band under the header) and from the right so it never touches the scrollbar. */}
        <Box
          sx={{
            position: 'absolute',
            top: '0.75rem',
            left: 0,
            right: '0.75rem',
            height: '2rem',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: scrolled ? 1 : 0,
            transition: 'opacity 0.2s ease',
            background: `linear-gradient(to bottom, ${figVars['bgp-2']}, transparent)`,
          }}
        />
        {!isLanguagesListOpen ? (
          <>
            {/* Only the options scroll — the action buttons below stay pinned. */}
            <Box sx={scrollAreaSx} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}>
              <NavItems setOpen={setOpen} />
              <Divider sx={{ borderColor: 'border-0', my: 2 }} />
              {/* Watch Wallet sits above the global-settings rows, no divider between them. */}
              <List disablePadding sx={menuListSx}>
                <ListItem sx={{ color: 'fg-1' }} onClick={handleOpenReadMode}>
                  <ListItemText>
                    <Trans>Watch Wallet</Trans>
                  </ListItemText>
                </ListItem>
                <DarkModeSwitcher />
                <ShieldSwitcher />
                {PROD_ENV && <TestNetModeSwitcher />}
                <LanguageListItem onClick={() => setIsLanguagesListOpen(true)} />
              </List>
            </Box>

            <Box sx={{ flexShrink: 0, position: 'relative' }}>
              {/* Fade scrim over the bottom of the scroll area, in place of a divider. */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  height: '2rem',
                  pointerEvents: 'none',
                  background: `linear-gradient(to top, ${figVars['bgp-2']}, transparent)`,
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', px: '0.75rem' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SwapIcon sx={{ fontSize: '18px' }} />}
                  onClick={handleSwap}
                  disabled={!showSwitchButton}
                >
                  <Trans>Swap</Trans>
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BridgeIcon sx={{ fontSize: '18px' }} />}
                  onClick={handleBridge}
                >
                  <Trans>Bridge GHO</Trans>
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={scrollAreaSx} onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}>
            <List
              disablePadding
              sx={{ ...menuListSx, '& .MuiListItemIcon-root': { width: 28, height: 20 } }}
            >
              <LanguagesList onClick={() => setIsLanguagesListOpen(false)} />
            </List>
          </Box>
        )}
      </DrawerWrapper>
    </>
  );
};
