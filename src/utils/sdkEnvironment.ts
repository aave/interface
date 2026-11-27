import { staging } from '@aave/react';

// Preview branch only: always origin staging, whatever the Vercel env says.
export const SDK_ENVIRONMENT = {
  ...staging,
  backend: 'https://api.origin.staging.aave.com/v3/graphql',
};
