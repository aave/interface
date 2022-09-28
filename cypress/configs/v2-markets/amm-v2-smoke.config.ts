import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/1-amm-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '0-assets/eth.amm-v2.cy.ts', folder + '0-assets/usdt.amm-v2.cy.ts'],
  },
});
