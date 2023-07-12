import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/2-avalanche-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [
      '/**/avax.avalanche-v3.cy.ts',
      '/**/dai.avalanche-v3.cy.ts',
      '/**/swap.avalanche-v2.cy.ts',
      '/**/e-mode.avalanche-v3.cy.ts',
      '/**/isolated-mode.avalanche-v3.cy.ts',
      '/**/critical-conditions.avalanche-v2.cy.ts',
      '/**/switch.avalanche-v3.cy.ts',
    ],
  },
});
