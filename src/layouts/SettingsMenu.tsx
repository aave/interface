import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Button, ListItemText, Menu, MenuItem, MenuList, SvgIcon } from '@mui/material';
import { useTheme } from '@mui/system';
import React from 'react';

import MenuSettingsIcon from '/public/icons/menuSettings.svg';

import { ColorModeContext } from './AppGlobalStyles';

export default function SettingsMenu() {
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
        size="medium"
        aria-label="settings"
        id="settings-button"
        aria-controls={open ? 'settings-button' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ p: '6px 8px', minWidth: 'unset', ml: 2 }}
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
        <MenuList disablePadding>
          <MenuItem onClick={colorMode.toggleColorMode}>
            <ListItemText>
              Switch to {theme.palette.mode === 'dark' ? 'light' : 'dark'} mode
            </ListItemText>
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}
