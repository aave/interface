import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

import { getMarketHelpData, getMarketInfoById, MarketLogo } from '../../components/MarketSwitcher';
import { ROUTES } from '../../components/primitives/Link';
import { CustomMarket } from '../../ui-config/marketsConfig';

interface IProps {
  marketId: CustomMarket;
}

export const MarketList = (props: IProps) => {
  const { marketId } = props;
  const { market, network } = getMarketInfoById(marketId);
  const marketNaming = getMarketHelpData(market.marketTitle);

  return (
    <Paper
      style={{ padding: 0 }}
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        // padding: 6,
      })}
    >
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <div style={{ padding: 16, background: network.themeColor, height: '150px' }}>
          <MarketLogo
            size={64}
            logo={network.networkLogoPath}
            testChainName={marketNaming.testChainName}
          />
        </div>
        <Box
          flexDirection={'column'}
          display={'flex'}
          flex={1}
          padding={4}
        // alignItems={'center'}
        // justifyContent={'center'}
        >
          <Typography component="div" variant="h2" mb={2} mt={2}>
            <Trans>
              {marketNaming.name} {market.isFork ? 'Fork' : ''}
            </Trans>
          </Typography>

          <Typography component="div" mb={2}>
            <Trans>{network.desc}</Trans>
          </Typography>

          <div>
            <Button variant="contained" href={`${ROUTES.markets}?marketName=${marketId}`}>
              <Trans>View {marketNaming.name} Market</Trans>
            </Button>
          </div>
        </Box>
      </Box>
    </Paper>
  );
};
