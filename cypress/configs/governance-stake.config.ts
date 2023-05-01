import { defineConfig } from 'cypress';
import { defaultConfig } from './base.cypress';

const folder = `./cypress/e2e/3-stake-governance`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + '**/*.*'],
    excludeSpecPattern: [],
  },
});
