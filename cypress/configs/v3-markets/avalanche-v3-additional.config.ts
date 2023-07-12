import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/2-avalanche-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + 'swap.avalanche-v3.cy.ts',
      folder + 'e-mode.avalanche-v3.cy.ts',
      folder + 'isolated-mode.avalanche-v3.cy.ts',
      folder + 'critical-conditions.avalanche-v3.cy.ts',
      folder + 'switch.avalanche-v3.cy.ts',
    ],
  },
});
