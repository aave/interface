import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/5-fantom-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [
      '/**/ftm.fantom-v3.cy.ts',
      '/**/usdt.fantom-v3.cy.ts',
      '/**/swap.fantom-v3.cy.ts',
      '/**/e-mode.fantom-v3.cy.ts',
      '/**/isolated-mode.fantom-v3.cy.ts',
      '/**/critical-conditions.fantom-v3.cy.ts',
    ],
  },
});
