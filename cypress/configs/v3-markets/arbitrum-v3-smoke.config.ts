import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/1-arbitrum-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/eth.arbitrum-v3.cy.ts',
      folder + '0-assets/usdt.arbitrum-v3.cy.ts',
    ],
  },
});
