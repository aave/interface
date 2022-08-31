import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/2-avalanche-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + "**/*.*"],
    excludeSpecPattern: [
      "/**/avax.avalanche-v3.spec.ts",
      "/**/dai.avalanche-v3.spec.ts",
      "/**/swap.avalanche-v2.spec.ts",
      "/**/e-mode.avalanche-v3.spec.ts",
      "/**/isolated-mode.avalanche-v3.spec.ts",
      "/**/critical-conditions.avalanche-v2.spec.ts",
    ],
  },
});
