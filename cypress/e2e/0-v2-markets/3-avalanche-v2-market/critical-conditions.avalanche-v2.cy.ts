import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, withdraw } from '../../../support/steps/main.steps';
import { checkDashboardHealthFactor } from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.avalancheMarket.AVAX,
      amount: 0.5,
      hasApproval: true,
    },
    borrow: {
      asset: assets.avalancheMarket.AVAX,
      amount: 1,
      apyType: constants.borrowAPYType.default,
      hasApproval: false,
      isRisk: true,
    },
    deposit2: {
      asset: assets.avalancheMarket.AVAX,
      amount: 1,
      hasApproval: true,
    },
    withdraw: {
      asset: assets.avalancheMarket.AVAX,
      isCollateral: true,
      amount: 10,
      hasApproval: false,
      isRisk: true,
      isMaxAmount: true,
    },
  },
};
//skip due  max  cap
describe.skip('CRITICAL CONDITIONS SPEC, AVALANCHE V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({});

  supply(testData.testCases.deposit1, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.5 }, skipTestState);
  supply(testData.testCases.deposit2, skipTestState, true);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
});
