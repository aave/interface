import { defineConfig } from 'cypress';
import { defaultConfig } from './base.cypress';

const folder = `./cypress/integration/2-settings/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + "**/*.*"],
  },
});
