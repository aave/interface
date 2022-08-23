{
  "integrationFolder": "cypress/e2/0-v2-markets/0-main-v2-market",
  "testFiles": [
    "**/*.*"
  ],
  "ignoreTestFiles": [
    "eth.aave-v2.cy.ts",
    "dai.aave-v2.cy.ts",
    "swap.aave-v2.cy.ts",
    "stake.aave-v2.cy.ts",
    "reward.aave-v2.cy.ts",
    "critical-conditions.aave-v2.cy.ts"
  ],
  "viewportWidth": 1200,
  "viewportHeight": 800,
  "defaultCommandTimeout": 40000,
  "pageLoadTimeout": 120000,
  "video": false,
  "scrollBehavior": "center",
  "retries": {
    "runMode": 1,
    "openMode": 0
  }
}

import { defineConfig } from 'cypress';
import { defaultConfig } from '../base.cypress';

const folder = `./cypress/e2e/0-v2-markets/3-avalanche-v2-market/`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default defineConfig({
  ...defaultConfig,
  e2e: {
    specPattern: [folder + "**/*.*"],
    excludeSpecPattern: [
      "./assets/eth.aave-v2.cy.ts",
      "*/dai.aave-v2.cy.ts",
      "./swap.aave-v2.cy.ts",
      "*/stake.aave-v2.cy.ts",
      "./reward.aave-v2.cy.ts",
      "./critical-conditions.aave-v2.cy.ts",
    ],
  },
});

