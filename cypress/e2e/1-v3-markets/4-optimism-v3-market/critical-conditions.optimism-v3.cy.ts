import { RequestedTokens, tokenSet } from 'cypress/support/helpers/token.helper';

import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyOptimismFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, withdraw } from '../../../support/steps/main.steps';
import { checkDashboardHealthFactor } from '../../../support/steps/verification.steps';

const tokensToRequest: RequestedTokens = {
  aETHOptimismV3: 1,
};

const testData = {
  testCases: {
    borrow: {
      asset: assets.optimismMarket.ETH,
      amount: 1,
      apyType: constants.borrowAPYType.default,
      hasApproval: false,
      isRisk: true,
    },
    deposit2: {
      asset: assets.optimismMarket.ETH,
      amount: 1,
      hasApproval: true,
    },
    withdraw: {
      asset: assets.optimismMarket.ETH,
      isCollateral: true,
      amount: 9999,
      hasApproval: false,
      isMaxAmount: true,
      isRisk: true,
    },
  },
};

describe('CRITICAL CONDITIONS SPEC, OPTIMISM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyOptimismFork({
    tokens: tokenSet(tokensToRequest),
  });
  borrow(testData.testCases.borrow, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
  supply(testData.testCases.deposit2, skipTestState, true);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
});
