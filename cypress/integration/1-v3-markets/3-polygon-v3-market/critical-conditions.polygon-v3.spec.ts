import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { supply, borrow, withdraw } from '../../../support/steps/main.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { checkDashboardHealthFactor } from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.polygonV3Market.MATIC,
      amount: 1,
      hasApproval: true,
    },
    borrow: {
      asset: assets.polygonV3Market.MATIC,
      amount: 1,
      apyType: constants.borrowAPYType.default,
      hasApproval: false,
      isRisk: true,
    },
    deposit2: {
      asset: assets.polygonV3Market.MATIC,
      amount: 1,
      hasApproval: true,
    },
    withdraw: {
      asset: assets.polygonV3Market.MATIC,
      isCollateral: true,
      amount: 10,
      hasApproval: false,
      isRisk: true,
    },
  },
};

describe('CRITICAL CONDITIONS SPEC, POLYGON V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ market: 'fork_proto_polygon_v3', v3: true });

  supply(testData.testCases.deposit1, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  supply(testData.testCases.deposit2, skipTestState, true);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
});
