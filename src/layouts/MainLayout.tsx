import { ChainId } from '@aave/contract-helpers';
import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
// import { useModalContext } from 'src/hooks/useModal';
import { SupportModal } from 'src/layouts/SupportModal';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

const getCampaignConfigs = () => ({
  [ChainId.base]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
  },

  [ChainId.sonic]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
    icon: '/icons/networks/sonic.svg',
  },

  [ChainId.mainnet]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
  },

  [ChainId.polygon]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
    icon: '/icons/networks/polygon.svg',
  },

  [ChainId.avalanche]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
    icon: '/icons/networks/avalanche.svg',
  },

  [ChainId.arbitrum_one]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
    icon: '/icons/networks/arbitrum.svg',
  },

  [ChainId.optimism]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
    icon: '/icons/networks/optimism.svg',
  },

  [ChainId.xdai]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
    icon: '/icons/networks/gnosis.svg',
  },

  [ChainId.bnb]: {
    notifyText: 'Aave app waitlist is now live!',
    buttonText: 'Get Access',
    buttonAction: {
      type: 'url' as const,
      value: 'https://aave.com/app',
      target: '_blank' as const,
    },
    bannerVersion: 'aave-app-waitlist-v1',
    icon: '/icons/networks/binance.svg',
  },
});

export function MainLayout({ children }: { children: ReactNode }) {
  const campaignConfigs = getCampaignConfigs();

  return (
    <>
      <TopBarNotify campaigns={campaignConfigs} />

      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
      <AppFooter />
      <SupportModal />
      {FORK_ENABLED ? null : <AnalyticsConsent />}
    </>
  );
}
