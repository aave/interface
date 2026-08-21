import { Trans } from '@lingui/macro';
import { Button, Divider, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { SettingsIcon } from 'src/components/icons/SettingsIcon';
import { useModalContext } from 'src/hooks/useModal';
import { DEFAULT_LOCALE } from 'src/libs/LanguageProvider';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';
import { PROD_ENV } from 'src/utils/marketsAndNetworksConfig';

import { DarkModeSwitcher } from './components/DarkModeSwitcher';
import { LanguageListItem, LanguagesList } from './components/LanguageSwitcher';
import { ShieldSwitcher } from './components/ShieldSwitcher';
import { TestNetModeSwitcher } from './components/TestNetModeSwitcher';

export const LANG_MAP = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  el: 'Greek',
};
type LanguageCode = keyof typeof LANG_MAP;

// Define the type for the language codes

// Example usage

export function SettingsMenu() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const { openReadMode } = useModalContext();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const trackEvent = useRootStore((store) => store.trackEvent);
  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    setSettingsOpen(true);
    setLanguagesOpen(false);
  };

  const handleLanguageClick = () => {
    const savedLocale = localStorage.getItem('LOCALE') || DEFAULT_LOCALE;
    const langCode = savedLocale as LanguageCode;
    setSettingsOpen(false);
    setLanguagesOpen(true);
    trackEvent(SETTINGS.LANGUAGE, { language: LANG_MAP[langCode] });
  };

  const handleCloseLanguage = () => {
    setSettingsOpen(true);
    setLanguagesOpen(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSettingsOpen(false);
    setLanguagesOpen(false);
  };

  const handleOpenReadMode = () => {
    setSettingsOpen(false);
    openReadMode();
  };

  return (
    <>
      <Button
        variant="tertiary"
        aria-label="settings"
        id="settings-button"
        aria-controls={settingsOpen ? 'settings-menu' : undefined}
        aria-expanded={settingsOpen ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleSettingsClick}
        sx={{ p: '0 0.5rem', minWidth: 'unset', ml: '0.62rem' }}
      >
        <SettingsIcon sx={{ fontSize: '20px', color: 'fg-2' }} />
      </Button>

      <Menu
        id="settings-menu"
        MenuListProps={{
          'aria-labelledby': 'settings-button',
        }}
        anchorEl={anchorEl}
        open={settingsOpen}
        onClose={handleClose}
        keepMounted={true}
      >
        <DarkModeSwitcher component={MenuItem} />
        <ShieldSwitcher component={MenuItem} />
        {PROD_ENV && <TestNetModeSwitcher component={MenuItem} />}

        <Divider sx={{ borderColor: 'border-0', m: '0.25rem' }} />

        <LanguageListItem onClick={handleLanguageClick} component={MenuItem} />

        <Divider sx={{ borderColor: 'border-0', m: '0.25rem' }} />

        <MenuItem onClick={handleOpenReadMode}>
          <ListItemText>
            <Trans>Watch Wallet</Trans>
          </ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        id="settings-menu"
        MenuListProps={{
          'aria-labelledby': 'settings-button',
        }}
        anchorEl={anchorEl}
        open={languagesOpen}
        onClose={handleClose}
        keepMounted={true}
      >
        <LanguagesList onClick={handleCloseLanguage} component={MenuItem} />
      </Menu>
    </>
  );
}
