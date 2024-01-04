import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/6-base-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: ['/**/weth.base-v3.cy.ts', '/**/usdbc.base-v3.cy.ts'],
  },
});
