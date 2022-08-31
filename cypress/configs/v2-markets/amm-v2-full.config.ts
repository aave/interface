import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/1-amm-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + "**/*.*"],
    excludeSpecPattern: [
      "/**/eth.amm-v2.cy.ts",
      "/**/usdt.amm-v2.cy.ts",
    ],
  },
});
