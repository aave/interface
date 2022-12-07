import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/6-gho_goerli-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  video: true,
  e2e: {
    specPattern: [
      // folder + 'gho-basic.gho-v3.cy.ts',
      folder + 'gho-discount-dashboard.gho-v3.cy.ts',
    ],
  },
});
