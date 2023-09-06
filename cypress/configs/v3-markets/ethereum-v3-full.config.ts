import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/0-ethereum-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: ['/**/eth.ethereum-v3.cy.ts', '/**/dai.ethereum-v3.cy.ts'],
  },
});
