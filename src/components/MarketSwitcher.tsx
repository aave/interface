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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React from 'react';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';

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

  return { market, network };
};

const getMarketHelpData = (marketName: string) => {
  const testChains = ['Kovan', 'Rinkeby', 'Mumbai', 'Fuji', 'Testnet'];
  const arrayName = marketName.split(' ');
  const testChainName = arrayName.filter((el) => testChains.indexOf(el) > -1);
  const formattedMarketTittle = arrayName.filter((el) => !testChainName.includes(el));

  return {
    name: formattedMarketTittle.join(' '),
    testChainName: testChainName[0],
  };
};

export type Market = {
  marketTitle: string;
  networkName: string;
  networkLogo: string;
  selected?: boolean;
};

type MarketLogoProps = {
  size: number;
  logo: string;
  testChainName?: string;
};

export const MarketLogo = ({ size, logo, testChainName }: MarketLogoProps) => {
  return (
    <Box sx={{ mr: 2, width: size, height: size, position: 'relative' }}>
      <img src={logo} alt="" width="100%" height="100%" />

      {testChainName && (
        <Tooltip title={testChainName} arrow>
          <Box
            sx={{
              bgcolor: '#29B6F6',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              color: 'common.white',
              fontSize: '12px',
              lineHeight: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: '-2px',
              bottom: '-2px',
            }}
          >
            {testChainName.split('')[0]}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export const MarketSwitcher = () => {
  const { currentMarket, setCurrentMarket } = useProtocolDataContext();
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const isV3MarketsAvailable = availableMarkets
    .map((marketId: CustomMarket) => {
      const { market } = getMarketInfoById(marketId);

      return market.v3;
    })
    .some((item) => !!item);

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
        className: 'MarketSwitcher__select',
        IconComponent: (props) => (
          <SvgIcon fontSize="medium" {...props}>
            <ChevronDownIcon />
          </SvgIcon>
        ),
        renderValue: (marketId) => {
          const { market, network } = getMarketInfoById(marketId as CustomMarket);

          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarketLogo
                size={upToLG ? 32 : 28}
                logo={network.networkLogoPath}
                testChainName={getMarketHelpData(market.marketTitle).testChainName}
              />
              <Box sx={{ mr: 1, display: 'inline-flex', alignItems: 'flex-start' }}>
                <Typography
                  variant={upToLG ? 'display1' : 'h1'}
                  sx={{
                    fontSize: downToXSM ? '1.55rem' : undefined,
                    color: 'common.white',
                    mr: 1,
                  }}
                >
                  {getMarketHelpData(market.marketTitle).name}
                </Typography>
                <Box
                  sx={{ color: '#FFFFFFB2', px: 2, borderRadius: '12px', background: '#2C2D3F' }}
                >
                  <Typography variant="subheader2">{market.v3 ? 'v3' : 'v2'}</Typography>
                </Box>
              </Box>
            </Box>
          );
        },
        sx: {
          '&.MarketSwitcher__select .MuiSelect-outlined': {
            p: 0,
            backgroundColor: 'transparent !important',
          },
          '.MuiSelect-icon': { color: 'common.white' },
        },
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
        <Typography variant="subheader2" color="text.secondary" sx={{ px: 4, py: 2 }}>
          <Trans>Select Aave Market</Trans>
        </Typography>
        <Divider />
      </Box>

      {isV3MarketsAvailable && (
        <Typography variant="subheader2" color="text.secondary" sx={{ px: 4, py: 2 }}>
          <Trans>v2 markets</Trans>
        </Typography>
      )}
      {availableMarkets.map((marketId: CustomMarket) => {
        const { market, network } = getMarketInfoById(marketId);

        return (
          !market.v3 && (
            <MenuItem
              key={marketId}
              cy-data={`market-selector-${marketId}`}
              value={marketId}
              sx={{ '.MuiListItemIcon-root': { minWidth: 'unset' } }}
            >
              <MarketLogo
                size={32}
                logo={network.networkLogoPath}
                testChainName={getMarketHelpData(market.marketTitle).testChainName}
              />
              <ListItemText sx={{ mr: 3 }}>
                {getMarketHelpData(market.marketTitle).name}
              </ListItemText>

              {currentMarket === marketId && (
                <ListItemIcon sx={{ m: 0 }}>
                  <SvgIcon>
                    <CheckIcon />
                  </SvgIcon>
                </ListItemIcon>
              )}
            </MenuItem>
          )
        );
      })}

      {isV3MarketsAvailable && <Divider />}

      {isV3MarketsAvailable && (
        <Typography variant="subheader2" color="text.secondary" sx={{ px: 4, py: 2 }}>
          <Trans>v3 markets</Trans>
        </Typography>
      )}
      {availableMarkets.map((marketId: CustomMarket) => {
        const { market, network } = getMarketInfoById(marketId);

        return (
          market.v3 && (
            <MenuItem
              key={marketId}
              cy-data={`market-selector-${marketId}`}
              value={marketId}
              sx={{ '.MuiListItemIcon-root': { minWidth: 'unset' } }}
            >
              <MarketLogo
                size={32}
                logo={network.networkLogoPath}
                testChainName={getMarketHelpData(market.marketTitle).testChainName}
              />
              <ListItemText sx={{ mr: 3 }}>
                {getMarketHelpData(market.marketTitle).name}
              </ListItemText>

              {currentMarket === marketId && (
                <ListItemIcon sx={{ m: 0 }}>
                  <SvgIcon>
                    <CheckIcon />
                  </SvgIcon>
                </ListItemIcon>
              )}
            </MenuItem>
          )
        );
      })}
    </TextField>
  );
};
