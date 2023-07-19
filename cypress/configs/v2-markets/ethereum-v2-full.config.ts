import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/0-main-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [
      '/**/eth.aave-v2.cy.ts',
      '/**/dai.aave-v2.cy.ts',
      '/**/swap.aave-v2.cy.ts',
      '/**/reward.aave-v2.cy.ts',
      '/**/critical-conditions.aave-v2.cy.ts',
      '/**/migration.aave-v2.cy.ts',
      '/**/switch.aave-v2.cy.ts',
    ],
  },
});
