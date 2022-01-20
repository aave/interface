import { ChainId } from '@aave/contract-helpers';
import { Button, ListItemText, Menu, MenuItem } from '@mui/material';
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
  const [selectedMarket, setSelectedMarket] = useState<Market>(markets[0]);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMarket = (market: Market) => {
    setSelectedMarket(market);
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        aria-label="more"
        id="wallet-button"
        aria-controls={open ? 'more-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={(event) => handleClick(event)}
        color="inherit"
      >
        <img
          src={selectedMarket.networkLogo}
          width="100%"
          height="100%"
          alt={`${selectedMarket.networkName} icon`}
        />
        <div>{selectedMarket.networkName}</div>
        <div>{selectedMarket.marketTitle}</div>
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
        {markets.map((market, index) => (
          <MenuItem key={index} onClick={() => handleSelectMarket(market)}>
            <ListItemText>
              <div>
                {/* <img
                  src={market.networkLogo}
                  width="100%"
                  height="100%"
                  alt={`${market.networkName} icon`}
                /> */}
                <div>{market.networkName}</div>
                <div>{market.marketTitle}</div>
              </div>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
