import { Trans } from '@lingui/macro';
import { Button, SvgIcon, Typography } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';
import { useRootStore } from 'src/store/root';
import { NAV_BAR } from 'src/utils/events';
import { onAccent } from 'src/utils/figmaColors';

import { Link, ROUTES } from '../../components/primitives/Link';
import { navLinkSx } from './navLinkSx';

interface StakingMenuProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function StakingMenu({ isMobile = false, onClose }: StakingMenuProps) {
  const trackEvent = useRootStore((store) => store.trackEvent);

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    trackEvent(NAV_BAR.MAIN_MENU, { nav_link: 'Staking' });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (title: string) => {
    trackEvent(NAV_BAR.MAIN_MENU, { nav_link: title });
    handleClose();
    if (onClose) onClose();
  };

  if (isMobile) {
    return (
      <>
        <Typography
          component={Link}
          href={ROUTES.staking}
          variant="h2"
          color={onAccent}
          sx={{ width: '100%', p: 4 }}
          onClick={() => handleMenuItemClick('Staking')}
        >
          <Trans>Umbrella</Trans>
        </Typography>
        <Typography
          component={Link}
          href={ROUTES.safetyModule}
          variant="h2"
          color={onAccent}
          sx={{ width: '100%', p: 4, pl: 6 }}
          onClick={() => handleMenuItemClick('Safety Module')}
        >
          <Trans>Safety Module</Trans>
        </Typography>
      </>
    );
  }

  return (
    <>
      <Button
        aria-label="staking menu"
        id="staking-button"
        aria-controls={open ? 'staking-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={navLinkSx('2.25rem 0.88rem')}
      >
        <Trans>Staking</Trans>
        <SvgIcon
          sx={{
            ml: '0.25rem',
            fontSize: '16px',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          <ChevronDownIcon />
        </SvgIcon>
      </Button>

      <Menu
        id="staking-menu"
        MenuListProps={{
          'aria-labelledby': 'staking-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted={true}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: 'surface-elevated',
            border: '1px solid',
            borderColor: 'border-2',
          },
        }}
      >
        <MenuItem
          component={Link}
          href={ROUTES.staking}
          onClick={() => handleMenuItemClick('Staking')}
          sx={{ minWidth: '140px' }}
        >
          <Typography variant="subheader1">
            <Trans>Umbrella</Trans>
          </Typography>
        </MenuItem>
        <MenuItem
          component={Link}
          href={ROUTES.safetyModule}
          onClick={() => handleMenuItemClick('Safety Module')}
          sx={{ minWidth: '140px' }}
        >
          <Typography variant="subheader1">
            <Trans>Safety Module</Trans>
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
