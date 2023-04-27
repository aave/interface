import mixpanel from 'mixpanel-browser';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export type TrackEventProperties = {
  [key: string]: string | number | boolean | Date | undefined;
};

export type AnalyticsSlice = {
  trackEvent: (eventName: string, properties?: TrackEventProperties) => void;
};

export const MIXPANEL_API_HOST = '/collect';

export const createAnalyticsSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  AnalyticsSlice
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
> = (set, get) => {
  return {
    trackEvent: (eventName: string, properties?: TrackEventProperties) => {
      const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL || '';
      // Note: if no mixpanel we ignore
      // todo: opt out
      if (!MIXPANEL_TOKEN) return null;

      const eventProperties = {
        ...properties,
        walletAddress: get().account,
      };
      mixpanel.track(eventName, eventProperties);
    },
  };
};
