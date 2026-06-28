import { defineConfig } from 'cypress';
import { defaultConfig } from './base.cypress';

const folder = `./cypress/e2e/5-widgets`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [],
  },
});
