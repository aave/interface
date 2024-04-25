import { defineConfig } from 'cypress';

import { defaultConfig } from './base.cypress';

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      './cypress/e2e/1-v3-markets/9-harmony-v3-market/general.harmony-v3.cy.ts',
      './cypress/e2e/1-v3-markets/10-metis-v3-market/general.metis-v3.cy.ts',
      './cypress/e2e/1-v3-markets/11-scroll-v3-market/general.scroll-v3.cy.ts',
    ],
  },
});
