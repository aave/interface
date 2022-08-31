import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/4-optimism-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + "critical-conditions.optimism-v3.spec.ts",
      folder + "e-mode.optimism-v3.spec.ts",
    ],
  },
});
