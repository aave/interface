// {
//   "integrationFolder": "cypress/e2e/0-v2-markets/3-avalanche-v2-market",
//   "testFiles": [
//     "0-assets/avax.avalanche-v2.cy.ts",
//     "0-assets/usdt.avalanche-v2.cy.ts",
//     "reward.avalanche-v2.cy.ts"
//   ],
//   "viewportWidth": 1200,
//   "viewportHeight": 800,
//   "defaultCommandTimeout": 40000,
//   "pageLoadTimeout": 120000,
//   "video": false,
//   "scrollBehavior": "center",
//   "retries": {
//     "runMode": 1,
//     "openMode": 0
//   }
// }

import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/3-avalanche-v2-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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
//excludeSpecPattern
