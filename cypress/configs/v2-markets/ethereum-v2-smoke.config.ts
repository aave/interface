import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/0-main-v2-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
  ...defaultConfig,
  defaultCommandTimeout: defaultConfig.defaultCommandTimeout,
  e2e: {
    specPattern: [
      folder + "0-assets/eth.aave-v2.cy.ts",
      folder + "0-assets/dai.aave-v2.cy.ts",
      folder + "reward.aave-v2.cy.ts",
    ],
  },
});
