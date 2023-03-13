import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/0-main-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  defaultCommandTimeout: 80000,
  e2e: {
    specPattern: [
      folder + '/**/swap.aave-v2.cy.ts',
      folder + '/**/reward.aave-v2.cy.ts',
      folder + '/**/critical-conditions.aave-v2.cy.ts',
      folder + '/**/migration.aave-v2.cy.ts',
    ],
  },
});
