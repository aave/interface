import { defineConfig } from 'cypress';

import { defaultConfig } from './base.cypress';

const folder = `./cypress/e2e/2-settings/`;

export default defineConfig({
  ...defaultConfig,
  viewportWidth: 375,
  viewportHeight: 812,
  e2e: {
    specPattern: [folder + 'mobile.cy.ts'],
  },
});
