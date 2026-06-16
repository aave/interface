import { Box, BoxProps, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { useRootStore } from 'src/store/root';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';
import {
  CustomMarket,
  MarketDataType,
  marketsData,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

export const getMarketInfoById = (marketId: CustomMarket) => {
  const market: MarketDataType = marketsData[marketId as CustomMarket];
  const network: BaseNetworkConfig = networkConfigs[market.chainId];
  const logo = market.logo || network.networkLogoPath;

  return { market, logo };
};

export const getMarketHelpData = (marketName: string) => {
  const testChains = [
    'Görli',
    'Ropsten',
    'Mumbai',
    'Sepolia',
    'Fuji',
    'Testnet',
    'Kovan',
    'Rinkeby',
  ];
  const arrayName = marketName.split(' ');
  const testChainName = arrayName.filter((el) => testChains.indexOf(el) > -1);
  const marketTitle = arrayName.filter((el) => !testChainName.includes(el)).join(' ');

  return {
    name: marketTitle,
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
  sx?: BoxProps;
};

export const MarketLogo = ({ size, logo, testChainName, sx }: MarketLogoProps) => {
  return (
    <Box sx={{ mr: 2, width: size, height: size, position: 'relative', ...sx }}>
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
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const currentMarket = useRootStore(useShallow((store) => store.currentMarket));

  const { market, logo } = getMarketInfoById(currentMarket);

  return (
    <Box sx={{ mr: 2 }}>
      {/* Main Row with Market Name */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <MarketLogo
          size={upToLG ? 32 : 28}
          logo={logo}
          testChainName={getMarketHelpData(market.marketTitle).testChainName}
        />
        <Typography
          variant={upToLG ? 'display1' : 'h1'}
          sx={{
            fontSize: downToXSM ? '1.55rem' : undefined,
            color: 'common.white',
            mr: 1,
          }}
        >
          {getMarketHelpData(market.marketTitle).name} {market.isFork ? 'Fork' : ''}
        </Typography>
      </Box>
    </Box>
  );
};
