import { defineConfig } from 'cypress';

import { defaultConfig } from './base.cypress';

const folder = `./cypress/e2e/2-settings/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: ['/**/mobile.cy.ts'],
  },
});
