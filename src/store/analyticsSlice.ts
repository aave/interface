import { add, init, setOptOut, track } from '@amplitude/analytics-browser';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

// Plugin to ensure all events have app_context
const createAppContextPlugin = (context: string) => ({
  name: 'app-context-plugin',
  type: 'enrichment' as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: async (event: any) => {
    return {
      ...event,
      event_properties: {
        ...event.event_properties,
        app_context: context,
      },
    };
  },
});

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
        app_context: 'app', // Fallback in case plugin doesn't apply
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
              language: false,
              platform: true,
            },
          });
          add(createAppContextPlugin('app'));
          set({ eventsTrackingInitialized: true });
        }

        setOptOut(false);
        set({ isTrackingEnabled: true });
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
          add(createAppContextPlugin('app'));
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
      // Track the opt-in event
      get().trackEvent('analytics_consent_given');
    },
    rejectAnalytics: () => {
      localStorage.setItem('userAcceptedAnalytics', 'false');

      // Track the opt-out event BEFORE disabling tracking
      // This is the only data we collect from users who opt out
      if (AMPLITUDE_API_KEY && !get().eventsTrackingInitialized) {
        // Initialize minimal tracking just for this one event
        init(AMPLITUDE_API_KEY, {
          autocapture: false,
          trackingOptions: {
            ipAddress: false,
            language: false,
            platform: false,
          },
        });
      }

      // Send the opt-out count event (no personal data, just the event)
      get().trackEvent('analytics_consent_declined');

      // Now disable all tracking
      setOptOut(true);
      set({ isTrackingEnabled: false, analyticsConfigOpen: false });
    },
    setAnalyticsConfigOpen: (value: boolean) => {
      localStorage.removeItem('userAcceptedAnalytics');

      set({ analyticsConfigOpen: value });
    },
  };
};
