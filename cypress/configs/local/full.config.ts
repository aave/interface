import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 40000,
  pageLoadTimeout: 120000,
  video: true,
  watchForFileChanges: false,
  scrollBehavior: 'center',
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../../../cypress/plugins/index.js')(on, config);
    },
    excludeSpecPattern: [
      './cypress/e2e/2-settings/*',
      './cypress/e2e/1-v3-markets/1-arbitrum-v3-market/*',
      './cypress/e2e/1-v3-markets/5-fantom-v3-market/*',
    ],
  },
});
