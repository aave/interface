import { ChainId } from '@aave/contract-helpers';
import { ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';

export type Market = {
  marketTitle: string;
  chainId: ChainId;
  networkName: string;
  networkLogo: string;
};

export type MarketSwitcherProps = {
  markets: Market[];
};

export const MarketSwitcher = ({ markets }: MarketSwitcherProps) => {
  const [selectedMarket, setSelectedMarket] = useState(markets[0]);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMarket = () => {
    // todo select market
    setAnchorEl(null);
  };

  return (
    <div>
      <div>{selectedMarket.marketTitle}</div>
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
        {markets.map((market, index) => (
          <MenuItem key={index} onClick={handleSelectMarket}>
            <ListItemText>market.marketTitle</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
