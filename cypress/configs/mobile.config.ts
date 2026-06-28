import { defineConfig } from 'cypress';

const folder = `./cypress/e2e/2-settings/`;

export default defineConfig({
  viewportWidth: 375,
  viewportHeight: 812,
  defaultCommandTimeout: 40000,
  pageLoadTimeout: 120000,
  video: false,
  watchForFileChanges: false,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../plugins/index.js')(on, config);
    },
    specPattern: [folder + 'mobile.cy.ts'],
  },
});
