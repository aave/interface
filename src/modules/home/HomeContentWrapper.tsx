import { ChainId } from '@aave/contract-helpers';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useRootStore } from 'src/store/root';

import { availableMarkets, CustomMarket } from '../../utils/marketsAndNetworksConfig';
import { Farming } from './Farming';
import { Guild } from './Guild';
import { MarketList } from './MarketList';

export const HomeContentWrapper = () => {
  const { breakpoints } = useTheme();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const isDesktop = useMediaQuery(breakpoints.up('lg'));
  const paperWidth = isDesktop ? 'calc(50% - 32px)' : '100%';

  const marketWidth = isDesktop ? 'calc(25% - 32px)' : '100%';

  return (
    <Box>
      {currentMarketData.chainId === ChainId.polygon && !currentMarketData.v3}
      <Box
        sx={{
          display: isDesktop ? 'flex' : 'block',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        {availableMarkets.map((marketId: CustomMarket, index: number) => {
          return (
            <Box sx={{ width: marketWidth }} key={marketId} mt={index !== 0 && !isDesktop ? 4 : 0}>
              <MarketList marketId={marketId} />
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: isDesktop ? 'flex' : 'block',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
        }}
        mt={4}
      >
        <Box sx={{ width: paperWidth }}>
          <Guild />
        </Box>
        <Box sx={{ width: paperWidth }} mt={!isDesktop ? 4 : 0}>
          <Farming />
        </Box>
      </Box>
    </Box>
  );
};
