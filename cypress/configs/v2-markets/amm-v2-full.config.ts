import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/1-amm-v2-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + "**/*.*"],
    excludeSpecPattern: [
      "*/eth.amm-v2.cy.ts",
      "./0-assets/usdt.amm-v2.cy.ts",
    ],
  },
});
