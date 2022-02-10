import { CheckIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';

import AaveNetworkLogo from '/public/icons/networks/aave.svg';

import { useProtocolDataContext } from '../hooks/useProtocolDataContext';
import {
  availableMarkets,
  CustomMarket,
  MarketDataType,
  marketsData,
  networkConfigs,
} from '../utils/marketsAndNetworksConfig';

export const getMarketInfoById = (marketId: CustomMarket) => {
  const market: MarketDataType = marketsData[marketId as CustomMarket];
  const network: BaseNetworkConfig = networkConfigs[market.chainId];

  const withAAVELogo = market.marketTitle.split(' ').some((item) => item === 'AAVE');

  return { market, network, withAAVELogo };
};

export type Market = {
  marketTitle: string;
  networkName: string;
  networkLogo: string;
  selected?: boolean;
};

export type MarketSwitcherProps = {
  markets: Market[];
};

type MarketLogoProps = {
  size: number;
  logo: string;
  withAAVELogo?: boolean;
};

export const MarketLogo = ({ size, logo, withAAVELogo }: MarketLogoProps) => {
  return (
    <Box sx={{ mr: 2, width: size, height: size }}>
      {withAAVELogo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          <AaveNetworkLogo width={size} height={size} />
          <img
            src={logo}
            alt=""
            width="50%"
            height="50%"
            style={{ position: 'absolute', right: '-2px', bottom: '-2px' }}
          />
        </Box>
      )}
      {!withAAVELogo && <img src={logo} alt="" width="100%" height="100%" />}
    </Box>
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
        mr: 2,
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      }}
      SelectProps={{
        native: false,
        IconComponent: (props) => (
          <SvgIcon fontSize="medium" {...props}>
            <ChevronDownIcon />
          </SvgIcon>
        ),
        renderValue: (marketId) => {
          const { market, network, withAAVELogo } = getMarketInfoById(marketId as CustomMarket);

          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarketLogo size={32} logo={network.networkLogoPath} withAAVELogo={withAAVELogo} />
              <Typography variant="h1" sx={{ color: 'common.white', mr: 3 }}>
                {market.marketTitle} <Trans>Market</Trans>
              </Typography>
            </Box>
          );
        },
        sx: { '.MuiSelect-outlined': { p: 0 }, '.MuiSelect-icon': { color: 'common.white' } },
        MenuProps: {
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          PaperProps: {
            style: {
              minWidth: 240,
            },
            variant: 'outlined',
            elevation: 0,
          },
        },
      }}
    >
      <Box>
        <Typography variant="subheader2" color="text.secondary" sx={{ padding: '12px 16px 8px' }}>
          <Trans>Select Aave Market</Trans>
        </Typography>
        <Divider />
      </Box>

      {availableMarkets.map((marketId: CustomMarket) => {
        const { market, network, withAAVELogo } = getMarketInfoById(marketId);

        return (
          <MenuItem
            key={marketId}
            cy-data={`market-selector-${marketId}`}
            value={marketId}
            sx={{ '.MuiListItemIcon-root': { minWidth: 'unset' } }}
          >
            <MarketLogo size={32} logo={network.networkLogoPath} withAAVELogo={withAAVELogo} />
            <ListItemText sx={{ mr: 3 }}>
              {market.marketTitle}
              {network.isFork && ' Fork'}
            </ListItemText>

            {currentMarket === marketId && (
              <ListItemIcon>
                <SvgIcon>
                  <CheckIcon />
                </SvgIcon>
              </ListItemIcon>
            )}
          </MenuItem>
        );
      })}
    </TextField>
  );
};
