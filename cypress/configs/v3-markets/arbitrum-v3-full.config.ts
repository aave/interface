import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/1-v3-markets/1-arbitrum-v3-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + "**/*.*"],
    excludeSpecPattern: [
      "/**/eth.arbitrum-v3.spec.ts",
      "/**/usdt.arbitrum-v3.spec.ts",
      "/**/e-mode.arbitrum-v3.spec.ts",
      "/**/critical-conditions.arbitrum-v3.spec.ts",
    ],
  },
});
