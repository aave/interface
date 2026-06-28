// This file configures the initialization of Sentry on the client (browser).
// The config you add here will be used whenever a user loads the app in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { shouldIgnoreError } from './src/utils/sentryFilters';

Sentry.init({
  dsn: 'https://f4f62da759bfe365562d0dfe080a255e@o4508407151525888.ingest.de.sentry.io/4510516896530512',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.01,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,

  beforeSend(event) {
    if (shouldIgnoreError(event)) return null;
    return event;
  },
});
