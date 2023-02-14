import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Button, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { Link } from '../components/primitives/Link';
import { buySellCryptoNavigation } from '../ui-config/menu-items';

export function BuySellCryptoMenu() {
  const { i18n } = useLingui();
  const { currentAccount: walletAddress } = useWeb3Context();

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
        id="buy-sell-crypto-button"
        aria-controls={open ? 'buy-sell-crypto-menu' : undefined}
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
        <Trans>Buy/sell</Trans>
      </Button>

      <Menu
        id="buy-sell-crypto-menu"
        MenuListProps={{
          'aria-labelledby': 'buy-sell-crypto-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted={true}
      >
        {buySellCryptoNavigation.map((item, index) => (
           <MenuItem
           component={item.type === 'WIDGET'? Button : Link}
           key={index}
           {...item.type === 'WIDGET' ? {
            onClick: () => { 
              item.onClick(walletAddress);
              handleClose();
            }} : {}}
           {...item.type === 'HOSTED' ? {href: item.makeLink ? item.makeLink(walletAddress) : item.link }: {}}
         >
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
