import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/4-gho-ethereum/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + 'gho-basic.ethereum-v3.cy.ts'],
  },
});
