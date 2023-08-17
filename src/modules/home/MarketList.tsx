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
      sx={() => ({
        marginRight: 2,
        //   // border: `1px solid ${theme.palette.divider}`,
        //   // padding: 6,
      })}
    >
      <Box flexDirection={'row'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
        <div style={{ padding: 16, background: network.themeColor, height: '200px' }}>
          <MarketLogo size={64} logo={network.networkLogoPath} />
        </div>
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
