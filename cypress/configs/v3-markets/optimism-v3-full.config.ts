import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/4-optimism-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/usdt.optimism-v3.cy.ts',
      folder + '0-assets/wbtc.optimism-v3.cy.ts',
      folder + 'critical-conditions.optimism-v3.cy.ts',
      folder + 'e-mode.optimism-v3.cy.ts',
    ],
  },
});
