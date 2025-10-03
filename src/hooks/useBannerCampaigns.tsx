import { ChainId } from '@aave/contract-helpers';
import { useRouter } from 'next/router';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { useShallow } from 'zustand/shallow';

export interface CampaignConfig {
  notifyText: string;
  buttonText: string;
  buttonAction: ButtonAction;
  bannerVersion: string;
  icon: string;
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

type CampaignChainId = ChainId.base | ChainId.mainnet | ChainId.arbitrum_one;

type CampaignConfigs = Partial<Record<CampaignChainId, CampaignConfig>>;

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
      notifyText: 'A new incentives campaign is live on the Base market',
      buttonText: 'Explore Base',
      buttonAction: {
        type: 'route' as const,
        value: '/markets/?marketName=proto_base_v3',
      },
      bannerVersion: 'base-incentives-v1',
      icon: '/icons/networks/base.svg',
    },

    // [ChainId.sonic]: {
    //   notifyText: 'Swaps are now live on Sonic',
    //   buttonText: 'Swap Now',
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.sonic),
    //   },
    //   bannerVersion: 'sonic-incentives-v1',
    //   icon: '/icons/networks/sonic.svg',
    // },

    [ChainId.mainnet]: {
      notifyText: 'The Plasma market is now live.',
      buttonText: 'Get Started',
      buttonAction: {
        type: 'function' as const,
        value: () => openMarket(CustomMarket.proto_plasma_v3),
      },
      bannerVersion: 'plasma-market-v0',
      icon: '/icons/networks/plasma.svg',
    },

    // [ChainId.polygon]: {
    //   notifyText: 'Swap tokens directly in the Aave App',
    //   buttonText: 'Swap Now',
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.polygon),
    //   },
    //   bannerVersion: 'polygon-swap-v1',
    //   icon: '/icons/networks/polygon.svg',
    // },

    // [ChainId.avalanche]: {
    //   notifyText: 'Swap tokens directly in the Aave App',
    //   buttonText: 'Swap Now',
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.avalanche),
    //   },
    //   bannerVersion: 'avalanche-swap-v1',
    //   icon: '/icons/networks/avalanche.svg',
    // },

    [ChainId.arbitrum_one]: {
      notifyText: 'Limit orders are now live on Arbitrum',
      buttonText: 'Swap Now',
      buttonAction: {
        type: 'function' as const,
        value: () => openSwitch('', ChainId.arbitrum_one),
      },
      bannerVersion: 'arbitrum-swap-v1',
      icon: '/icons/networks/arbitrum.svg',
    },

    // [ChainId.optimism]: {
    //   notifyText: 'Swap tokens directly in the Aave App',
    //   buttonText: 'Swap Now',
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.optimism),
    //   },
    //   bannerVersion: 'optimism-swap-v1',
    //   icon: '/icons/networks/optimism.svg',
    // },

    // [ChainId.xdai]: {
    //   notifyText: 'Swap tokens directly in the Aave App',
    //   buttonText: 'Swap Now',
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.xdai),
    //   },
    //   bannerVersion: 'gnosis-swap-v1',
    //   icon: '/icons/networks/gnosis.svg',
    // },

    // [ChainId.bnb]: {
    //   notifyText: 'Swap tokens directly in the Aave App',
    //   buttonText: 'Swap Now',
    //   buttonAction: {
    //     type: 'function' as const,
    //     value: () => openSwitch('', ChainId.bnb),
    //   },
    //   bannerVersion: 'binance-swap-v1',
    //   icon: '/icons/networks/binance.svg',
    // },
  };

  const isCampaignChainId = (chainId: ChainId): chainId is CampaignChainId => {
    return chainId in campaignConfigs;
  };

  if (!chainId || !isCampaignChainId(chainId)) {
    return {};
  }

  return { [chainId]: campaignConfigs[chainId]! };
};
