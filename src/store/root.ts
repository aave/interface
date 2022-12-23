import { V3FaucetService } from '@aave/contract-helpers';
import { enableMapSet } from 'immer';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { ENABLE_TESTNET, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';
import create from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createGovernanceSlice, GovernanceSlice } from './governanceSlice';
import { createIncentiveSlice, IncentiveSlice } from './incentiveSlice';
import { createPoolSlice, PoolSlice } from './poolSlice';
import { createProtocolDataSlice, ProtocolDataSlice } from './protocolDataSlice';
import { createStakeSlice, StakeSlice } from './stakeSlice';
import { createSingletonSubscriber } from './utils/createSingletonSubscriber';
import { getQueryParameter } from './utils/queryParams';
import { createWalletSlice, WalletSlice } from './walletSlice';

enableMapSet();

export type RootStore = StakeSlice &
  ProtocolDataSlice &
  WalletSlice &
  PoolSlice &
  IncentiveSlice &
  GovernanceSlice;

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

export const useStakeDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refetchStakeData();
}, 60000);

export const useWalletBalancesSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refetchWalletBalances();
}, 60000);

export const usePoolDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshPoolData();
}, 60000);

export const useIncentiveDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshIncentiveData();
}, 60000);

export const useGovernanceDataSubscription = createSingletonSubscriber(() => {
  return useRootStore.getState().refreshGovernanceData();
}, 60000);

useRootStore.subscribe(
  (state) => state.currentMarketData,
  async (selected) => {
    const { setIsFaucetPermissioned: setFaucetPermissioned, jsonRpcProvider } =
      useRootStore.getState();
    if (ENABLE_TESTNET || STAGING_ENV) {
      if (!selected.v3) {
        console.log('not a v3 testnet market');
        setFaucetPermissioned(false);
        return;
      }

      try {
        const service = new V3FaucetService(jsonRpcProvider(), selected.addresses.FAUCET);
        console.log('checking faucet permission');
        const isPermissioned = await service.isPermissioned();
        console.log('is faucet permissioned', isPermissioned);
        setFaucetPermissioned(isPermissioned);
      } catch (e) {
        console.error('error checking faucet permission', e);
        setFaucetPermissioned(false);
      }
    } else {
      setFaucetPermissioned(false);
    }
  },
  { fireImmediately: true }
);
