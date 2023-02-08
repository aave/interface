import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/3-avalanche-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + 'swap.avalanche-v2.cy.ts',
      folder + 'critical-conditions.avalanche-v2.cy.ts',
      folder + 'migration.avalanche-v2.cy.ts',
    ],
  },
});
