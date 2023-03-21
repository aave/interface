import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL;

const initMixpanel = (): void => {
  if (typeof window !== 'undefined' && MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN);
  }
};

const trackEvent = (eventName: string, eventProperties: Record<string, unknown> = {}): void => {
  if (typeof window !== 'undefined' && MIXPANEL_TOKEN) {
    mixpanel.track(eventName, eventProperties);
  }
};

export { initMixpanel, trackEvent };
