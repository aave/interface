import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/5-fantom-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + 'swap.fantom-v3.cy.ts',
      folder + 'e-mode.fantom-v3.cy.ts',
      folder + 'isolated-mode.fantom-v3.cy.ts',
      folder + 'critical-conditions.fantom-v3.cy.ts',
    ],
  },
});
