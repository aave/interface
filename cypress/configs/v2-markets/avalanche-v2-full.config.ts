import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/3-avalanche-v2-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
  e2e: {
    specPattern: [folder + "**/*.*"],
    excludeSpecPattern: [
      'assets/avax.avalanche-v2.cy.ts',
      'assets/usdt.avalanche-v2.cy.ts',
      './reward.avalanche-v2.cy.ts',
      './swap.avalanche-v2.cy.ts',
      './critical-conditions.avalanche-v2.cy.ts',
    ],
  },
  ...defaultConfig,
});
