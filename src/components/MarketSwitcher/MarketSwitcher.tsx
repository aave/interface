import styled from '@emotion/styled';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button, ListItemText, Menu, MenuItem } from '@mui/material';
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
  selected?: boolean;
};

export type MarketSwitcherProps = {
  markets: Market[];
};

const MarketNameContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'left',
}));

const Text = styled('h1')(({ theme }) => ({
  fontWeight: '900',
  fontSize: '32px',
  lineHeight: '40px',
  marginLeft: '5px',
  marginBottom: '0px',
  alignSelf: 'felx-end',
}));

const NetworkLogo = styled('img')(({ theme }) => ({
  width: '32px',
  height: '32px',
  alignSelf: 'flex-end',
}));

export const MarketName = ({ networkLogo, networkName, marketTitle, selected }: Market) => {
  return (
    <MarketNameContainer>
      <NetworkLogo src={networkLogo} width="100%" height="100%" alt={`${networkName} icon`} />
      <Text>{networkName}</Text>
      <Text>{marketTitle}</Text>
      {selected && <KeyboardArrowDownIcon sx={{ alignSelf: 'flex-end' }} fontSize="large" />}
    </MarketNameContainer>
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
        variant="text"
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
          selected
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
