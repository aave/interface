export const defaultConfig = {
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 50000,
  pageLoadTimeout: 120000,
  video: false,
  watchForFileChanges: false,
  retries: {
    runMode: 0,
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
};
