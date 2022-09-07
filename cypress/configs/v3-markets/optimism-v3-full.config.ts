import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/4-optimism-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [
      '/**/eth.optimism-v3.cy.ts',
      '/**/usdt.optimism-v3.cy.ts',
      '/**/critical-conditions.optimism-v3.cy.ts',
      '/**/e-mode.optimism-v3.cy.ts',
    ],
  },
});
