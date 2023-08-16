import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/2-avalanche-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/wbtc.avalanche-v3.cy.ts',
      folder + '0-assets/usdt.avalanche-v3.cy.ts',
      folder + 'critical-conditions.avalanche-v3.cy.ts',
      folder + 'e-mode.avalanche-v3.cy.ts',
      folder + 'isolated-mode.avalanche-v3.cy.ts',
      folder + 'swap.avalanche-v3.cy.ts',
      folder + 'switch.avalanche-v3.cy.ts',
    ],
  },
});
