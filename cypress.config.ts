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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('../plugins/index.js')(on, config);
    },
  },
});
