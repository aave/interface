import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/3-polygon-v3-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/wbtc.polygon-v3.cy.ts',
      folder + '0-assets/eurs.polygon-v3.cy.ts',
      folder + 'critical-conditions.polygon-v3.cy.ts',
      folder + 'e-mode.polygon-v3.cy.ts',
      folder + 'swap.polygon-v3.cy.ts',
      folder + 'isolated-mode.polygon-v3.cy.ts',
      folder + 'switch.polygon-v3.cy.ts',
    ],
  },
});
