import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { useShallow } from 'zustand/shallow';

export interface CampaignConfig {
  notifyText: ReactNode;
  buttonText: ReactNode;
  buttonAction: ButtonAction;
  bannerVersion: string;
  icon?: string;
}

export type ButtonAction =
  | {
      type: 'route';
      value: string;
    }
  | {
      type: 'function';
      value: () => void;
    };

type CampaignConfigs = Partial<Record<ChainId, CampaignConfig>>;

export type NetworkCampaigns = { [chainId: number]: CampaignConfig };

export const useBannerCampaigns = (chainId?: ChainId): NetworkCampaigns => {
  const router = useRouter();
  const [setCurrentMarket] = useRootStore(useShallow((store) => [store.setCurrentMarket]));
  const { openSwitch } = useModalContext();

  const openMarket = (market: CustomMarket) => {
    setCurrentMarket(market);
    router.push(`/markets/?marketName=${market}`);
  };

  const campaignConfigs: CampaignConfigs = {
    [ChainId.base]: {
      notifyText: <Trans>A new incentives campaign is live on the Base market</Trans>,
      buttonText: <Trans>Explore Base</Trans>,
      buttonAction: {
        type: 'route' as const,
        value: '/markets/?marketName=proto_base_v3',
      },
      bannerVersion: 'base-incentives-v1',
      icon: '/icons/networks/base.svg',
    },

    // [ChainId.sonic]: {
    //   notifyText: <Trans>Swaps are now live on Sonic</Trans>,
    //   buttonText: <Trans>Swap Now</Trans>,
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.sonic),
    //   },
    //   bannerVersion: 'sonic-incentives-v1',
    //   icon: '/icons/networks/sonic.svg',
    // },

    [ChainId.mainnet]: {
      notifyText: <Trans>The Plasma market is now live.</Trans>,
      buttonText: <Trans>Get Started</Trans>,
      buttonAction: {
        type: 'function' as const,
        value: () => openMarket(CustomMarket.proto_plasma_v3),
      },
      bannerVersion: 'plasma-market-v0',
      icon: '/icons/networks/plasma.svg',
    },

    // [ChainId.polygon]: {
    //   notifyText: <Trans>Swap tokens directly in the Aave App</Trans>,
    //   buttonText: <Trans>Swap Now</Trans>,
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.polygon),
    //   },
    //   bannerVersion: 'polygon-swap-v1',
    //   icon: '/icons/networks/polygon.svg',
    // },

    // [ChainId.avalanche]: {
    //   notifyText: <Trans>Swap tokens directly in the Aave App</Trans>,
    //   buttonText: <Trans>Swap Now</Trans>,
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.avalanche),
    //   },
    //   bannerVersion: 'avalanche-swap-v1',
    //   icon: '/icons/networks/avalanche.svg',
    // },

    [ChainId.arbitrum_one]: {
      notifyText: <Trans>Limit orders are now live on Arbitrum</Trans>,
      buttonText: <Trans>Swap Now</Trans>,
      buttonAction: {
        type: 'function' as const,
        value: () => openSwitch('', ChainId.arbitrum_one),
      },
      bannerVersion: 'arbitrum-swap-v1',
      icon: '/icons/networks/arbitrum.svg',
    },

    // [ChainId.optimism]: {
    //   notifyText: <Trans>Swap tokens directly in the Aave App</Trans>,
    //   buttonText: <Trans>Swap Now</Trans>,
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.optimism),
    //   },
    //   bannerVersion: 'optimism-swap-v1',
    //   icon: '/icons/networks/optimism.svg',
    // },

    // [ChainId.xdai]: {
    //   notifyText: <Trans>Swap tokens directly in the Aave App</Trans>,
    //   buttonText: <Trans>Swap Now</Trans>,
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.xdai),
    //   },
    //   bannerVersion: 'gnosis-swap-v1',
    //   icon: '/icons/networks/gnosis.svg',
    // },

    // [ChainId.bnb]: {
    //   notifyText: <Trans>Swap tokens directly in the Aave App</Trans>,
    //   buttonText: <Trans>Swap Now</Trans>,
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.bnb),
    //   },
    //   bannerVersion: 'binance-swap-v1',
    //   icon: '/icons/networks/binance.svg',
    // },
  };

  const isCampaignChainId = (chainId: ChainId): chainId is ChainId => {
    return chainId in campaignConfigs;
  };

  if (!chainId || !isCampaignChainId(chainId)) {
    return {};
  }

  return { [chainId]: campaignConfigs[chainId]! };
};
