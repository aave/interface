import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/6-base-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '0-assets/weth.base-v3.cy.ts', folder + '0-assets/usdbc.base-v3.cy.ts'],
  },
});
