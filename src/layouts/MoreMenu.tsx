import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Button, ListItemText, MenuList, SvgIcon } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';

import { Link } from '../components/Link';
import { moreNavigation } from '../ui-config/menu-items';

export function MoreMenu() {
  const { i18n } = useLingui();

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
        aria-label="more"
        id="more-button"
        aria-controls={open ? 'more-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          color: 'common.white',
          minWidth: 'unset',
          '&:hover': {
            bgcolor: 'rgba(250, 251, 252, 0.08)',
          },
        }}
      >
        <Trans>More</Trans>
        <MoreHorizIcon color="inherit" />
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
            minWidth: 240,
          },
        }}
      >
        <MenuList disablePadding>
          {moreNavigation.map((item, index) => (
            <MenuItem component={Link} href={item.link} key={index}>
              <ListItemText>{i18n._(item.title)}</ListItemText>
              <SvgIcon>{item.icon}</SvgIcon>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
}
