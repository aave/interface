import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { NetworkConfig } from '../../ui-config/networksConfig';
import { BridgeButton } from '../BridgeButton';
import { MarketSwitcher } from '../MarketSwitcher';

export interface PageTitleProps extends Pick<NetworkConfig, 'bridge'> {
  pageTitle: ReactNode;
  withMarketSwitcher?: boolean;
}

export const PageTitle = ({ pageTitle, withMarketSwitcher, bridge }: PageTitleProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Typography variant="h1" sx={{ opacity: '0.7', mr: 3 }}>
        {pageTitle}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        {withMarketSwitcher && <MarketSwitcher />}
        <BridgeButton bridge={bridge} variant="surface" />
      </Box>
    </Box>
  );
};
