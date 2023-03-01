import { StateCreator } from 'zustand';

import { RootStore } from './root';
import { domainFetchers } from './utils/domain-fetchers';

export enum DomainType {
  DEFAULT,
  ENS,
}

export type WalletDomain = {
  name?: string;
  avatar?: string;
  type: DomainType;
};

export type WalletDomainsSlice = {
  userDomains: WalletDomain[];
  defaultDomain: WalletDomain | null;
  fetchConnectedWalletDomains: () => Promise<void>;
  clearWalletDomains: () => void;
  domainsLoading: boolean;
};

export const createWalletDomainsSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  WalletDomainsSlice
> = (set, get) => ({
  defaultDomain: null,
  domainsLoading: false,
  userDomains: [],
  fetchConnectedWalletDomains: async () => {
    set({ domainsLoading: true });
    const address = get().account;
    const result = await Promise.all(domainFetchers.map((fetcher) => fetcher(address)));
    const notNullDomains = result.filter((elem): elem is WalletDomain => elem !== null);
    set({
      userDomains: notNullDomains,
      defaultDomain: notNullDomains[0] ?? null,
      domainsLoading: false,
    });
  },
  clearWalletDomains: () => {
    set({ userDomains: [], defaultDomain: null });
  },
});
