import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/7-gnosis-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: ['/**/usdc.gnosis-v3.cy.ts', '/**/xdai.gnosis-v3.cy.ts'],
  },
});
