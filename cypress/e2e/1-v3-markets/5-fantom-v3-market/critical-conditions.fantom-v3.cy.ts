import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constants.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyFantomFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, withdraw } from '../../../support/steps/main.steps';
import { checkDashboardHealthFactor } from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.fantomMarket.FTM,
      amount: 1,
      hasApproval: true,
    },
    borrow: {
      asset: assets.fantomMarket.FTM,
      amount: 1,
      apyType: constants.borrowAPYType.default,
      hasApproval: false,
      isRisk: false,
    },
    deposit2: {
      asset: assets.fantomMarket.FTM,
      amount: 1,
      hasApproval: true,
    },
    withdraw: {
      asset: assets.fantomMarket.FTM,
      isCollateral: true,
      amount: 9999,
      hasApproval: false,
      isMaxAmount: true,
      isRisk: true,
    },
  },
};

describe('CRITICAL CONDITIONS SPEC, FANTOM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomFork({ v3: true });

  supply(testData.testCases.deposit1, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 2.3 }, skipTestState);
  supply(testData.testCases.deposit2, skipTestState, true);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
});
