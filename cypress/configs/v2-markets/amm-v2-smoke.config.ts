import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/1-amm-v2-market/`;

const defaultConfig2 = {
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 60000,
  pageLoadTimeout: 120000,
  video: false,
  watchForFileChanges: false,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../../plugins/index.js')(on, config);
    },
  },
};



export default defineConfig({
  ...defaultConfig2,
  e2e: {
    specPattern: [
      folder + "0-assets/eth.amm-v2.cy.ts",
      folder + "0-assets/usdt.amm-v2.cy.ts",
    ],
  },
});
