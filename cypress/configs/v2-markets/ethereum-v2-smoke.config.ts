import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/0-main-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '0-assets/eth.aave-v2.cy.ts', folder + '0-assets/dai.aave-v2.cy.ts'],
  },
});
