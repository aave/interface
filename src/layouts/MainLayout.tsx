import { ChainId } from '@aave/contract-helpers';
import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import AnalyticsConsent from 'src/components/Analytics/AnalyticsConsent';
import { useBannerCampaigns } from 'src/hooks/useBannerCampaigns';
import { SupportModal } from 'src/layouts/SupportModal';
import { useRootStore } from 'src/store/root';
import { getQueryParameter } from 'src/store/utils/queryParams';
import { CustomMarket, marketsData } from 'src/ui-config/marketsConfig';
import { FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

const getIntendedChainId = (currentChainId?: ChainId): ChainId => {
  // Priority 1: currentChainId from store
  if (currentChainId) {
    return currentChainId;
  }

  if (typeof window !== 'undefined') {
    // Priority 2: localStorage selectedMarket
    const selectedMarket = localStorage.getItem('selectedMarket');
    if (selectedMarket && marketsData[selectedMarket as CustomMarket]) {
      return marketsData[selectedMarket as CustomMarket].chainId;
    }

    // Priority 3: URL params marketName
    const urlMarket = getQueryParameter('marketName');
    if (urlMarket && marketsData[urlMarket as CustomMarket]) {
      return marketsData[urlMarket as CustomMarket].chainId;
    }
  }

  // Priority 4: Default to mainnet
  return ChainId.mainnet;
};

export function MainLayout({ children }: { children: ReactNode }) {
  const [currentChainId] = useRootStore(useShallow((store) => [store.currentChainId]));

  const intendedChainId = getIntendedChainId(currentChainId);
  const filteredCampaigns = useBannerCampaigns(intendedChainId);

  return (
    <>
      <TopBarNotify campaigns={filteredCampaigns} />

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
