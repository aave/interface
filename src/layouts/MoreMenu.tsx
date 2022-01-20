import { GitHub, LibraryBooks, QuestionMarkOutlined } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Button, Divider, ListItemIcon, ListItemText, MenuList } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, useTheme } from '@mui/system';
import * as React from 'react';

import { ColorModeContext } from './AppGlobalStyles';

export default function MoreMenu() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ ml: 2 }}>
      <Button
        variant="outlined"
        size="small"
        aria-label="more"
        id="more-button"
        aria-controls={open ? 'more-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ px: 0.5, width: '36px', minWidth: 0 }}
        color="inherit"
      >
        <MoreHorizIcon />
      </Button>
      <Menu
        id="more-menu"
        MenuListProps={{
          'aria-labelledby': 'more-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            minWidth: 120,
          },
        }}
      >
        <MenuList>
          <MenuItem>
            <ListItemIcon>
              <QuestionMarkOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>FAQ</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <LibraryBooks fontSize="small" />
            </ListItemIcon>
            <ListItemText>Developers</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemIcon>
              <QuestionMarkOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>Discord</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <GitHub fontSize="small" />
            </ListItemIcon>
            <ListItemText>Github</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={colorMode.toggleColorMode}>
            <ListItemIcon>
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText>
              Switch to {theme.palette.mode === 'dark' ? 'light' : 'dark'} mode
            </ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}
