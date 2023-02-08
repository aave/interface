import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/3-avalanche-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [
      '/**/avax.avalanche-v2.cy.ts',
      '/**/usdt.avalanche-v2.cy.ts',
      '/**/reward.avalanche-v2.cy.ts',
      '/**/swap.avalanche-v2.cy.ts',
      '/**/critical-conditions.avalanche-v2.cy.ts',
      '/**/migration.avalanche-v2.cy.ts',
    ],
  },
});
