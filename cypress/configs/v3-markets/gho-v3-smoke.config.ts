import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/7-gho_sepolia-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + 'gho-basic.gho-v3.cy.ts',
      folder + 'gho-discount-dashboard.gho-v3.cy.ts',
      folder + 'gho-modal.gho-v3.cy.ts',
    ],
  },
});
