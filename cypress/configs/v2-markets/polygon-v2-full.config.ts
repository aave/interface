import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/2-polygon-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [
      '/**/matic.polygon-v2.cy.ts',
      '/**/usdt.polygon-v2.cy.ts',
      '/**/swap.polygon-v2.cy.ts',
      '/**/critical-conditions.polygon-v2.cy.ts',
      '/**/migration.polygon-v2.cy.ts',
    ],
  },
});
