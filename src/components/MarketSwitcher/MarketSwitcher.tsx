import styled from '@emotion/styled';
import { MenuItem, TextField } from '@mui/material';
import React from 'react';
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
  alignItems: 'center',
}));

const Text = styled('h1')(({ theme }) => ({
  fontWeight: '900',
  fontSize: '32px',
  marginLeft: '16px',
  marginRight: '16px',
}));

const NetworkLogo = styled('img')(({ theme }) => ({
  width: '32px',
  height: '32px',
}));

export const MarketName = ({ networkLogo, networkName, marketTitle }: Market) => {
  return (
    <MarketNameContainer>
      <NetworkLogo src={networkLogo} width="100%" height="100%" alt={`${networkName} icon`} />
      <Text>
        {networkName} {marketTitle}
      </Text>
    </MarketNameContainer>
  );
};

export const MarketSwitcher = () => {
  const { currentMarket, setCurrentMarket } = useProtocolDataContext();

  return (
    <TextField
      select
      aria-label="select market"
      cy-data="market-selector"
      value={currentMarket}
      onChange={(e) => setCurrentMarket(e.target.value as unknown as CustomMarket)}
      sx={{
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      }}
    >
      {availableMarkets.map((marketId: CustomMarket) => {
        const market: MarketDataType = marketsData[marketId];
        const network: BaseNetworkConfig = networkConfigs[market.chainId];

        return (
          <MenuItem key={marketId} cy-data={`market-selector-${marketId}`} value={marketId}>
            <MarketName
              marketTitle={market.marketTitle}
              networkLogo={network.networkLogoPath}
              networkName={network.name}
            />
          </MenuItem>
        );
      })}
    </TextField>
  );
};
