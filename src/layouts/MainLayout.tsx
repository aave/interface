import { ChainId } from '@aave/contract-helpers';
import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { useModalContext } from 'src/hooks/useModal';
import { FeedbackModal } from 'src/layouts/FeedbackDialog';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

const getCampaignConfigs = (openSwitch: (token?: string, chainId?: number) => void) => ({
  [ChainId.base]: {
    notifyText: 'A new incentives campaign is live on the Base market',
    buttonText: 'Explore Base',
    buttonAction: {
      type: 'route' as const,
      value: '/markets/?marketName=proto_base_v3',
    },
    bannerVersion: 'base-incentives-v1',
    icon: '/icons/networks/base.svg',
  },

  [ChainId.sonic]: {
    notifyText: 'Swaps are now live on Sonic',
    buttonText: 'Swap Now',
    buttonAction: {
      type: 'function' as const,
      value: () => openSwitch('', ChainId.sonic),
    },
    bannerVersion: 'sonic-incentives-v1',
    icon: '/icons/networks/sonic.svg',
  },
});

export function MainLayout({ children }: { children: ReactNode }) {
  const { openSwitch } = useModalContext();

  const campaignConfigs = getCampaignConfigs(openSwitch);

  return (
    <>
      <TopBarNotify campaigns={campaignConfigs} />

      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
      <AppFooter />
      <FeedbackModal />
      {FORK_ENABLED ? null : <AnalyticsConsent />}
    </>
  );
}
