import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/3-avalanche-v2-market/`;

export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [
      folder + '0-assets/avax.avalanche-v2.cy.ts',
      folder + '0-assets/usdt.avalanche-v2.cy.ts',
      folder + 'reward.avalanche-v2.cy.ts',
    ],
  },
});
