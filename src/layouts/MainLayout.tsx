import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
// import { useModalContext } from 'src/hooks/useModal';
import { SupportModal } from 'src/layouts/SupportModal';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

const getCampaignConfigs = () => ({});

// For defining Route specific campaigns if needed in future
const routeCampaigns = {
  // '/sgho': {
  //   notifyText: "Earn 4% higher yield on savings GHO using OKX's GHO staking vault.",
  //   buttonText: 'Learn more',
  //   buttonAction: {
  //     type: 'url' as const,
  //     value: 'https://web3.okx.com/earn/activity/aave-gho',
  //     target: '_blank' as const,
  //   },
  //   bannerVersion: 'sgho-okx-v1',
  // },
};

export function MainLayout({ children }: { children: ReactNode }) {
  const campaignConfigs = getCampaignConfigs();

  return (
    <>
      <TopBarNotify campaigns={campaignConfigs} routeCampaigns={routeCampaigns} />

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
