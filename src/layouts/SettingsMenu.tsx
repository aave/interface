import { Trans } from '@lingui/macro';
import { Button, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { SettingsIcon } from 'src/components/icons/SettingsIcon';
import { useModalContext } from 'src/hooks/useModal';
import { DEFAULT_LOCALE } from 'src/libs/LanguageProvider';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';
import { PROD_ENV } from 'src/utils/marketsAndNetworksConfig';

import { LanguageListItem, LanguagesList } from './components/LanguageSwitcher';
import { ShieldSwitcher } from './components/ShieldSwitcher';
import { TestNetModeSwitcher } from './components/TestNetModeSwitcher';
import { ThemeListItem, ThemesList } from './components/ThemeSwitcher';

export const LANG_MAP = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  el: 'Greek',
};
type LanguageCode = keyof typeof LANG_MAP;

// The drill-in lists the root menu can hand off to; keys double as the view state.
const SUBMENUS = { languages: LanguagesList, themes: ThemesList };

// Shared by the root menu and the submenu so the two can't drift apart.
const MENU_PROPS = {
  id: 'settings-menu',
  MenuListProps: { 'aria-labelledby': 'settings-button' },
  keepMounted: true,
};

export function SettingsMenu() {
  // One exclusive view rather than a boolean per menu — a new submenu costs a union member and a
  // `SUBMENUS` entry, not another flag to remember to reset. Mirrors `MobileMenu`.
  const [view, setView] = useState<'settings' | keyof typeof SUBMENUS | null>(null);
  const { openReadMode } = useModalContext();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const trackEvent = useRootStore((store) => store.trackEvent);
  const SubmenuList = view && view !== 'settings' ? SUBMENUS[view] : null;

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    setView('settings');
  };

  const handleLanguageClick = () => {
    const savedLocale = localStorage.getItem('LOCALE') || DEFAULT_LOCALE;
    const langCode = savedLocale as LanguageCode;
    setView('languages');
    trackEvent(SETTINGS.LANGUAGE, { language: LANG_MAP[langCode] });
  };

  const handleClose = () => {
    setAnchorEl(null);
    setView(null);
  };

  const handleOpenReadMode = () => {
    setView(null);
    openReadMode();
  };

  return (
    <>
      <Button
        variant="outlined"
        aria-label="settings"
        id="settings-button"
        aria-controls={view === 'settings' ? 'settings-menu' : undefined}
        aria-expanded={view === 'settings' ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleSettingsClick}
        sx={{ p: '0 0.5rem', minWidth: 'unset', ml: '0.62rem' }}
      >
        <SettingsIcon sx={{ fontSize: '20px', color: 'fg-2' }} />
      </Button>

      <Menu {...MENU_PROPS} anchorEl={anchorEl} open={view === 'settings'} onClose={handleClose}>
        <ShieldSwitcher component={MenuItem} />
        {PROD_ENV && <TestNetModeSwitcher component={MenuItem} />}
        <LanguageListItem onClick={handleLanguageClick} component={MenuItem} />
        <ThemeListItem onClick={() => setView('themes')} component={MenuItem} />

        <MenuItem onClick={handleOpenReadMode}>
          <ListItemText>
            <Trans>Watch Wallet</Trans>
          </ListItemText>
        </MenuItem>
      </Menu>

      <Menu {...MENU_PROPS} anchorEl={anchorEl} open={SubmenuList !== null} onClose={handleClose}>
        {SubmenuList && <SubmenuList onClick={() => setView('settings')} component={MenuItem} />}
      </Menu>
    </>
  );
}
