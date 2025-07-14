import { init, setOptOut, track } from '@amplitude/analytics-browser';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || '';

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
  initializeEventsTracking: () => void;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  analyticsConfigOpen: boolean;
  setAnalyticsConfigOpen: (eventName: boolean) => void;
  eventsTrackingInitialized: boolean;
  // Simple referral tracking from aave.com
  checkForWebsiteReferral: () => void;
  cameFromWebsite: boolean;
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
    trackEvent: (eventName: string, properties: TrackEventProperties = {}) => {
      const EXCLUDED_NETWORKS = ['fork_proto_mainnet', 'fork_proto_mainnet_v3'];
      const trackingEnable = get().isTrackingEnabled;

      if (!trackingEnable) return null;

      const eventProperties = {
        ...properties,
        walletAddress: get().account,
        market: properties.market ?? get().currentMarket,
        walletType: get().walletType,
        cameFromWebsite: get().cameFromWebsite,
      };

      try {
        if (!EXCLUDED_NETWORKS.includes(get().currentMarket)) {
          track(eventName, eventProperties);
        }
      } catch (err) {
        console.log('something went wrong tracking event', err);
      }
    },

    isTrackingEnabled: false,
    analyticsConfigOpen: true,
    eventsTrackingInitialized: false,
    cameFromWebsite: false,

    checkForWebsiteReferral: () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const ampDeviceId = urlParams.get('ampDeviceId');

      if (ampDeviceId) {
        set({ cameFromWebsite: true });

        get().trackEvent('App Entered From Website', {
          ampDeviceId,
          landingPage: window.location.pathname,
        });

        // Clean the URL
        urlParams.delete('ampDeviceId');
        const newUrl =
          window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    },

    initializeEventsTracking: () => {
      const userAcceptedAnalytics = localStorage.getItem('userAcceptedAnalytics') === 'true';
      const isInitialized = get().eventsTrackingInitialized;

      if (!AMPLITUDE_API_KEY) return;

      if (userAcceptedAnalytics) {
        if (!isInitialized) {
          init(AMPLITUDE_API_KEY, {
            // serverZone: 'EU',
            autocapture: true, // disable if we don't want to capture every click and page view on the site
            trackingOptions: {
              ipAddress: false,
              language: true,
              platform: true,
            },
          });
          set({ eventsTrackingInitialized: true });
        }

        setOptOut(false);
        set({ isTrackingEnabled: true });

        // Check for website referral aave.com
        get().checkForWebsiteReferral();
      } else {
        if (!isInitialized) {
          init(AMPLITUDE_API_KEY, {
            // serverZone: 'EU',
            autocapture: false,
            trackingOptions: {
              ipAddress: false,
              language: false,
              platform: false,
            },
          });
          set({ eventsTrackingInitialized: true });
        }

        setOptOut(true);
        set({ isTrackingEnabled: false });
      }
    },
    acceptAnalytics: () => {
      localStorage.setItem('userAcceptedAnalytics', 'true');
      set({ isTrackingEnabled: true, analyticsConfigOpen: false });

      get().initializeEventsTracking();
    },
    rejectAnalytics: () => {
      localStorage.setItem('userAcceptedAnalytics', 'false');
      setOptOut(true);
      set({ isTrackingEnabled: false, analyticsConfigOpen: false });
    },
    setAnalyticsConfigOpen: (value: boolean) => {
      localStorage.removeItem('userAcceptedAnalytics');

      set({ analyticsConfigOpen: value });
    },
  };
};
