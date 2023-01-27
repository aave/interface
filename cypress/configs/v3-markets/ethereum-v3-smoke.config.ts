import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v3-markets/0-ethereum-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/eth.ethereum-v3.cy.ts',
      folder + '0-assets/dai.ethereum-v3.cy.ts',
    ],
  },
});
