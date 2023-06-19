import mixpanel from 'mixpanel-browser';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL || '';

export type TrackEventProperties = {
  [key: string]: string | number | boolean | Date | undefined;
};

export type TrackEventProps = {
  eventName: string;
  eventParams?: TrackEventProperties;
};

export type AnalyticsSlice = {
  trackEvent: (eventName: string, properties?: TrackEventProperties) => void;
  isTrackingEnabled: boolean;
  initializeMixpanel: () => void;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  analyticsConfigOpen: boolean;
  setAnalyticsConfigOpen: (eventName: boolean) => void;
  mixpanelInitialized: boolean;
};

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
      const trackingEnable = get().isTrackingEnabled;

      if (!trackingEnable) return null;

      const eventProperties = {
        ...properties,
        walletAddress: get().account,
        market: get().currentMarket,
        walletType: get().walletType,
      };

      try {
        if (get().currentMarket != 'proto_scroll_alpha_v3')
          mixpanel.track(eventName, eventProperties);
      } catch (err) {
        console.log('something went wrong tracking event', err);
      }
    },

    isTrackingEnabled: false,
    analyticsConfigOpen: true,
    mixpanelInitialized: false,

    initializeMixpanel: () => {
      const userAcceptedAnalytics = localStorage.getItem('userAcceptedAnalytics') === 'true';
      const isInitialized = get().mixpanelInitialized;

      if (!MIXPANEL_TOKEN) return;

      if (userAcceptedAnalytics) {
        if (!isInitialized) {
          mixpanel.init(MIXPANEL_TOKEN, { ip: false });
          set({ mixpanelInitialized: true });
        }

        mixpanel.opt_in_tracking();
        set({ isTrackingEnabled: true });
      } else {
        if (!isInitialized) {
          mixpanel.init(MIXPANEL_TOKEN, { ip: false });
          set({ mixpanelInitialized: true });
        }
        mixpanel.opt_out_tracking();
        set({ isTrackingEnabled: false });
      }
    },
    acceptAnalytics: () => {
      localStorage.setItem('userAcceptedAnalytics', 'true');
      set({ isTrackingEnabled: true, analyticsConfigOpen: false });

      get().initializeMixpanel();
    },
    rejectAnalytics: () => {
      localStorage.setItem('userAcceptedAnalytics', 'false');
      // mixpanel.opt_out_tracking();
      set({ isTrackingEnabled: false, analyticsConfigOpen: false });
    },
    setAnalyticsConfigOpen: (value: boolean) => {
      localStorage.removeItem('userAcceptedAnalytics');

      set({ analyticsConfigOpen: value });
    },
  };
};
