import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/5-fantom-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/ftm.fantom-v3.cy.ts',
      folder + '0-assets/usdt.fantom-v3.cy.ts',
    ],
  },
});
