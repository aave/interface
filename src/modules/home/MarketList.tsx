import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

import { getMarketHelpData, getMarketInfoById, MarketLogo } from '../../components/MarketSwitcher';
import { ROUTES } from '../../components/primitives/Link';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';
import { useRootStore } from '../../store/root';
import { CustomMarket } from '../../ui-config/marketsConfig';
import { DASHBOARD } from '../../utils/mixPanelEvents';

interface IProps {
  marketId: CustomMarket;
}

export const MarketList = (props: IProps) => {
  const { marketId } = props;
  const { market, network } = getMarketInfoById(marketId);
  const marketNaming = getMarketHelpData(market.marketTitle);
  const trackEvent = useRootStore((store) => store.trackEvent);
  const { setCurrentMarket } = useProtocolDataContext();

  const handleMarketSelect = () => {
    trackEvent(DASHBOARD.CHANGE_MARKET, { market: marketId });
    setCurrentMarket(marketId as unknown as CustomMarket);
  };

  return (
    <Paper
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        padding: 6,
      })}
    >
      <Box
        flexDirection={'row'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        mb={6}
      >
        <MarketLogo
          size={32}
          logo={network.networkLogoPath}
          testChainName={marketNaming.testChainName}
        />
        <Typography component="div" variant="h2" align={'center'}>
          <Trans>
            {marketNaming.name} {market.isFork ? 'Fork' : ''}
          </Trans>
        </Typography>
      </Box>
      <Typography component="div" align={'center'} fontWeight={600}>
        <Trans>{network.desc}</Trans>
      </Typography>
      <Box mt={8} flexDirection={'row'} display={'flex'} justifyContent={'center'}>
        <Button variant="contained" href={`${ROUTES.markets}?marketName=${marketId}`}>
          <Trans>View {marketNaming.name} Market</Trans>
        </Button>
      </Box>
    </Paper>
  );
};
