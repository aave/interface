import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, withdraw } from '../../../support/steps/main.steps';
import { checkDashboardHealthFactor } from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.polygonMarket.MATIC,
      amount: 1,
      hasApproval: true,
    },
    borrow: {
      asset: assets.polygonMarket.MATIC,
      amount: 1,
      apyType: constants.borrowAPYType.default,
      hasApproval: false,
      isRisk: true,
    },
    deposit2: {
      asset: assets.polygonMarket.MATIC,
      amount: 1,
      hasApproval: true,
    },
    withdraw: {
      asset: assets.polygonMarket.MATIC,
      isCollateral: true,
      amount: 9999,
      hasApproval: false,
      isRisk: true,
      isMaxAmount: true,
    },
  },
};

describe.skip('CRITICAL CONDITIONS SPEC, POLYGON V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({});

  supply(testData.testCases.deposit1, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
  supply(testData.testCases.deposit2, skipTestState, true);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
});
