import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

import { getMarketInfoById, MarketLogo } from '../../components/MarketSwitcher';
import { ROUTES } from '../../components/primitives/Link';
import { CustomMarket } from '../../ui-config/marketsConfig';

interface IProps {
  marketId: CustomMarket;
}

export const MarketList = (props: IProps) => {
  const { marketId } = props;
  const { network } = getMarketInfoById(marketId);

  return (
    <Paper
      style={{ padding: 0 }}
    >
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <Box
          style={{ background: network.themeColor, height: '200px' }}
          position={'relative'}
          p={4}
          width={116}
        >
          <Box position={'absolute'} top={'50%'} sx={{ transform: 'translate(0,-50%)' }}>
            <MarketLogo size={84} logo={network.networkLogoPath} />
          </Box>
        </Box>
        <Box
          flexDirection={'column'}
          display={'flex'}
          justifyContent={'space-between'}
          flex={1}
          padding={4}
        >
          <Typography component="div" variant="h2" mb={2} mt={2}>
            {network.name} Market
          </Typography>

          <Typography component="div" mb={6}>
            <Trans>{network.desc}</Trans>
          </Typography>

          <div>
            <Button variant="contained" href={`${ROUTES.markets}?marketName=${marketId}`}>
              <Trans>View Market</Trans>
            </Button>
          </div>
        </Box>
      </Box>
    </Paper>
  );
};
