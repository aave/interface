import { DotsHorizontalIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Button, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';

import { Link } from '../components/primitives/Link';
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
          color: '#F1F1F3',
          minWidth: 'unset',
          p: '6px 8px',
          '&:hover': {
            bgcolor: 'rgba(250, 251, 252, 0.08)',
          },
        }}
      >
        <Trans>More</Trans>
        <SvgIcon color="inherit" sx={{ ml: 1 }}>
          <DotsHorizontalIcon />
        </SvgIcon>
      </Button>

      <Menu
        id="more-menu"
        MenuListProps={{
          'aria-labelledby': 'more-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted={true}
      >
        {moreNavigation.map((item, index) => (
          <MenuItem component={Link} href={item.link} key={index}>
            <ListItemIcon>
              <SvgIcon sx={{ fontSize: '20px' }}>{item.icon}</SvgIcon>
            </ListItemIcon>
            <ListItemText>{i18n._(item.title)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
