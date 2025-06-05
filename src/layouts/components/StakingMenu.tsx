import { ChevronDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon, Typography } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { useRootStore } from 'src/store/root';
import { NAV_BAR } from 'src/utils/events';

import { Link, ROUTES } from '../../components/primitives/Link';

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
          color="#F1F1F3"
          sx={{ width: '100%', p: 4 }}
          onClick={() => handleMenuItemClick('Staking')}
        >
          <Trans>Umbrella</Trans>
        </Typography>
        <Typography
          component={Link}
          href={ROUTES.safetyModule}
          variant="h2"
          color="#F1F1F3"
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
        sx={(theme) => ({
          color: '#F1F1F3',
          p: '6px 8px',
          position: 'relative',
          '.active&:after, &:hover&:after': {
            transform: 'scaleX(1)',
            transformOrigin: 'bottom left',
          },
          '&:after': {
            content: "''",
            position: 'absolute',
            width: '100%',
            transform: 'scaleX(0)',
            height: '2px',
            bottom: '-6px',
            left: '0',
            background: theme.palette.gradients.aaveGradient,
            transformOrigin: 'bottom right',
            transition: 'transform 0.25s ease-out',
          },
        })}
      >
        <Trans>Staking</Trans>
        <SvgIcon
          sx={{
            ml: 0.5,
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
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
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
