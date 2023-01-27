import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v3-markets/0-ethereum-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '/**/swap.ethereum-v3.cy.ts',
      folder + '/**/critical-conditions.ethereum-v3.cy.ts',
    ],
  },
});
