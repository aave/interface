import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/2-polygon-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '0-assets/usdt.polygon-v2.cy.ts', folder + 'swap.aave-v2.cy.ts'],
  },
});
