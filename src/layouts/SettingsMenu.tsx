import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  Button,
  FormControlLabel,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  SvgIcon,
  Switch,
} from '@mui/material';
import { useTheme } from '@mui/system';
import React from 'react';

import MenuSettingsIcon from '/public/icons/menuSettings.svg';

import { ColorModeContext } from './AppGlobalStyles';
import { LanguageSelector } from 'src/components/LanguageSelector';

export function SettingsMenu() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="surface"
        aria-label="settings"
        id="settings-button"
        aria-controls={open ? 'settings-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
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
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: 240,
          },
        }}
      >
        <MenuItem onClick={colorMode.toggleColorMode} disableRipple>
          <ListItemText>Dark mode</ListItemText>
          <FormControlLabel
            value="darkmode"
            control={<Switch disableRipple checked={theme.palette.mode === 'dark'} />}
            label={theme.palette.mode === 'dark' ? 'On' : 'Off'}
            labelPlacement="start"
          />
        </MenuItem>
        <MenuItem disableRipple>
          <ListItemText>Language</ListItemText>
          <LanguageSelector />
        </MenuItem>
      </Menu>
    </>
  );
}
