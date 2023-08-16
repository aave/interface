import { defineConfig } from 'cypress';

import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/3-polygon-v3-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/matic.polygon-v3.cy.ts',
      folder + '0-assets/dai.polygon-v3.cy.ts',
    ],
  },
});
