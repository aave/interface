import { local, production, staging } from '@aave/react';

const SDK_ENVIRONMENT_PRESET = (() => {
  switch (process.env.NEXT_PUBLIC_BACKEND_ENVIRONMENT) {
    case 'local':
      return local;
    case 'staging':
      return staging;
    default:
      return production;
  }
})();

export const SDK_ENVIRONMENT = {
  ...SDK_ENVIRONMENT_PRESET,
  backend: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || SDK_ENVIRONMENT_PRESET.backend,
};
