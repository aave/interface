import { defineConfig } from 'cypress';

const folder = `cypress/e2e/0-v2-markets/3-avalanche-v2-market/`;

export default defineConfig({
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 40000,
  pageLoadTimeout: 120000,
  video: false,
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
      return require('./cypress/plugins/index.js')(on, config);
    },
    specPattern :[
      folder + "0-assets/avax.avalanche-v2.cy.ts"
    ]
  },
})
