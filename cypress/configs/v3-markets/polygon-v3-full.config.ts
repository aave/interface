import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/3-polygon-v3-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [
      '/**/matic.polygon-v3.cy.ts',
      '/**/eurs.polygon-v3.cy.ts',
      '/**/swap.polygon-v3.cy.ts',
      '/**/e-mode.polygon-v3.cy.ts',
      '/**/isolated-mode.polygon-v3.cy.ts',
      '/**/isolated-and-emode.polygon-v3.cy.ts',
      '/**/critical-conditions.polygon-v3.cy.ts',
      '/**/switch.polygon-v3.cy.ts',
    ],
  },
});
