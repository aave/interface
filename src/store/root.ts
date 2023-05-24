import { V3FaucetService } from '@aave/contract-helpers';
import { enableMapSet } from 'immer';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { ENABLE_TESTNET, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createGovernanceSlice, GovernanceSlice } from './governanceSlice';
import { createIncentiveSlice, IncentiveSlice } from './incentiveSlice';
import { createLayoutSlice, LayoutSlice } from './layoutSlice';
import { createPoolSlice, PoolSlice } from './poolSlice';
import { createProtocolDataSlice, ProtocolDataSlice } from './protocolDataSlice';
import { createStakeSlice, StakeSlice } from './stakeSlice';
import { getQueryParameter } from './utils/queryParams';
import { createV3MigrationSlice, V3MigrationSlice } from './v3MigrationSlice';
import { createWalletDomainsSlice, WalletDomainsSlice } from './walletDomains';
import { createWalletSlice, WalletSlice } from './walletSlice';

enableMapSet();

export type RootStore = StakeSlice &
  ProtocolDataSlice &
  WalletSlice &
  PoolSlice &
  IncentiveSlice &
  GovernanceSlice &
  V3MigrationSlice &
  WalletDomainsSlice &
  LayoutSlice;

export const useRootStore = create<RootStore>()(
  subscribeWithSelector(
    devtools((...args) => {
      return {
        ...createStakeSlice(...args),
        ...createProtocolDataSlice(...args),
        ...createWalletSlice(...args),
        ...createPoolSlice(...args),
        ...createIncentiveSlice(...args),
        ...createGovernanceSlice(...args),
        ...createV3MigrationSlice(...args),
        ...createWalletDomainsSlice(...args),
        ...createLayoutSlice(...args),
      };
    })
  )
);

// hydrate state from localeStorage to not break on ssr issues
if (typeof document !== 'undefined') {
  document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
      const selectedMarket =
        getQueryParameter('marketName') || localStorage.getItem('selectedMarket');

      if (selectedMarket) {
        const currentMarket = useRootStore.getState().currentMarket;
        const setCurrentMarket = useRootStore.getState().setCurrentMarket;
        if (selectedMarket !== currentMarket) {
          setCurrentMarket(selectedMarket as CustomMarket, true);
        }
      }
    }
  };
}

let latest: V3FaucetService;
useRootStore.subscribe(
  (state) => state.currentMarketData,
  async (selected) => {
    const { setIsFaucetPermissioned: setFaucetPermissioned, jsonRpcProvider } =
      useRootStore.getState();
    if (ENABLE_TESTNET || STAGING_ENV) {
      if (!selected.v3) {
        setFaucetPermissioned(false);
        return;
      }

      // If there are multiple calls in flight, we only want to use the result from the latest one.
      // Use the instance of the service to check if it's the latest one since it is recreated
      // everytime this subscription fires.
      const service = new V3FaucetService(jsonRpcProvider(), selected.addresses.FAUCET);
      latest = service;
      service
        .isPermissioned()
        .then((isPermissioned) => {
          if (latest === service) {
            setFaucetPermissioned(isPermissioned);
          }
        })
        .catch((e) => {
          console.error('error checking faucet permission', e);
          setFaucetPermissioned(false);
        });
    } else {
      setFaucetPermissioned(false);
    }
  },
  { fireImmediately: true }
);

useRootStore.subscribe(
  (state) => state.account,
  (account) => {
    if (account) {
      useRootStore.getState().fetchConnectedWalletDomains();
    } else {
      useRootStore.getState().clearWalletDomains();
    }
  },
  { fireImmediately: true }
);
