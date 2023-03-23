import mixpanel from 'mixpanel-browser';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export type AnalyticsSlice = {
  trackEvent: (eventName: string, properties?: { [key: string]: string }) => void;
};

export const createAnalyticsSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  AnalyticsSlice
> = (set, get) => {
  return {
    trackEvent: (eventName: string, properties?: { [key: string]: string }) => {
      const eventProperties = {
        ...properties,
        walletAddress: get().account,
      };
      mixpanel.track(eventName, eventProperties);
    },
  };
};
