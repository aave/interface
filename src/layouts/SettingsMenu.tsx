import {
  Button,
  FormControlLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Switch,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/system';
import React, { useState } from 'react';
import { t, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { CheckIcon, ChevronLeftIcon } from '@heroicons/react/solid';

import MenuSettingsIcon from '/public/icons/menuSettings.svg';
import { ColorModeContext } from './AppGlobalStyles';
import { dynamicActivateLanguage } from 'src/libs/LanguageProvider';

const langMap = {
  en: t`English`,
  es: t`Spanish`,
};

export function SettingsMenu() {
  const { i18n } = useLingui();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    setSettingsOpen(true);
    setLanguagesOpen(false);
  };

  const handleLanguageClick = () => {
    setSettingsOpen(false);
    setLanguagesOpen(true);
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

  return (
    <>
      <Button
        variant="surface"
        aria-label="settings"
        id="settings-button"
        aria-controls={settingsOpen ? 'settings-menu' : undefined}
        aria-expanded={settingsOpen ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleSettingsClick}
        sx={{ p: '7px 8px', minWidth: 'unset', ml: 2 }}
      >
        <SvgIcon sx={{ color: 'common.white' }} fontSize="small">
          <MenuSettingsIcon />
        </SvgIcon>
      </Button>

      <Menu
        id="settings-menu"
        MenuListProps={{
          'aria-labelledby': 'settings-button',
        }}
        anchorEl={anchorEl}
        open={settingsOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: 240,
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="subheader2">
            <Trans>Global settings</Trans>
          </Typography>
        </MenuItem>
        <MenuItem onClick={colorMode.toggleColorMode} disableRipple>
          <ListItemText>
            <Trans>Dark mode</Trans>
          </ListItemText>
          <FormControlLabel
            value="darkmode"
            control={<Switch disableRipple checked={theme.palette.mode === 'dark'} />}
            label={theme.palette.mode === 'dark' ? 'On' : 'Off'}
            labelPlacement="start"
          />
        </MenuItem>
        <MenuItem onClick={handleLanguageClick} disableRipple>
          <ListItemText>
            <Trans>Language</Trans>
          </ListItemText>
          {langMap[i18n.locale as keyof typeof langMap]}
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
        PaperProps={{
          style: {
            minWidth: 240,
          },
        }}
      >
        <MenuItem onClick={handleCloseLanguage}>
          <ListItemIcon>
            <SvgIcon fontSize="small">
              <ChevronLeftIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText disableTypography>
            <Typography variant="subheader2">
              <Trans>Select language</Trans>
            </Typography>
          </ListItemText>
        </MenuItem>
        {Object.keys(langMap).map((lang) => (
          <MenuItem disableRipple key={lang} onClick={() => dynamicActivateLanguage(lang)}>
            <ListItemText>{i18n._(langMap[lang as keyof typeof langMap])}</ListItemText>
            {lang === i18n.locale && (
              <ListItemIcon>
                <SvgIcon fontSize="small">
                  <CheckIcon />
                </SvgIcon>
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
