// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://f4f62da759bfe365562d0dfe080a255e@o4508407151525888.ingest.de.sentry.io/4510516896530512',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.01,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,

  // Filter out noisy errors from third-party libraries that spam Sentry
  ignoreErrors: [
    // WalletConnect relay subscription reconnection spam
    'Connection interrupted while trying to subscribe',
    'Restore will override. subscription',
    // Wallet extension conflicts (multiple wallets fighting over window.ethereum)
    'Cannot redefine property: ethereum',
    'Cannot set property ethereum',
    // RPC rotation provider errors (expected fallback behavior)
    'missing revert data in call exception',
    // Common wallet connection errors that are expected and not actionable
    'User rejected the request',
    'user rejected transaction',
  ],

  beforeSend(event) {
    const message = event.exception?.values?.[0]?.value || '';

    // Drop WalletConnect relay/subscription errors
    if (message.includes('Connection interrupted') || message.includes('Restore will override')) {
      return null;
    }

    // Drop wallet extension conflicts
    if (
      message.includes('Cannot redefine property: ethereum') ||
      message.includes('Cannot set property ethereum')
    ) {
      return null;
    }

    // Drop RPC rotation errors (rotationProvider retries automatically)
    if (message.includes('missing revert data in call exception')) {
      return null;
    }

    return event;
  },
});
