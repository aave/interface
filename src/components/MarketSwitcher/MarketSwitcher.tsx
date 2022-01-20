import { Button, Icon, ListItemText, Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';

import { useProtocolDataContext } from '../../hooks/useProtocolData';
import {
  availableMarkets,
  CustomMarket,
  MarketDataType,
  marketsData,
  networkConfigs,
} from '../../utils/marketsAndNetworksConfig';

export type Market = {
  marketTitle: string;
  networkName: string;
  networkLogo: string;
};

export type MarketSwitcherProps = {
  markets: Market[];
};

export const MarketName = ({ networkLogo, networkName, marketTitle }: Market) => {
  return (
    <div>
      <Icon>
        <img src={networkLogo} width="100%" height="100%" alt={`${networkName} icon`} />
      </Icon>
      <div>{networkName}</div>
      <div>{marketTitle}</div>
    </div>
  );
};

export const MarketSwitcher = () => {
  const { currentMarket, setCurrentMarket, currentMarketData, currentNetworkConfig } =
    useProtocolDataContext();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectMarket = (marketId: CustomMarket) => {
    setCurrentMarket(marketId);
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
        <MarketName
          marketTitle={currentMarketData.marketTitle}
          networkLogo={currentNetworkConfig.networkLogoPath}
          networkName={currentNetworkConfig.name}
        />
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
        {availableMarkets
          .filter((marketId) => marketId !== currentMarket)
          .map((marketId: CustomMarket) => {
            const market: MarketDataType = marketsData[marketId];
            const network: BaseNetworkConfig = networkConfigs[market.chainId];

            return (
              <MenuItem
                key={`market-selector-${marketId}`}
                onClick={() => handleSelectMarket(marketId)}
              >
                <ListItemText>
                  <MarketName
                    marketTitle={market.marketTitle}
                    networkLogo={network.networkLogoPath}
                    networkName={network.name}
                  />
                </ListItemText>
              </MenuItem>
            );
          })}
      </Menu>
    </div>
  );
};
