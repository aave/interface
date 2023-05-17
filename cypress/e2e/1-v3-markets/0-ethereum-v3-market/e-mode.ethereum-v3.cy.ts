import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAEthereumV3Fork } from '../../../support/steps/configuration.steps';
import { borrow, emodeActivating, supply } from '../../../support/steps/main.steps';
import {
  borrowsAvailable,
  checkDashboardHealthFactor,
} from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.ethereumV3Market.ETH,
      amount: 0.01,
      hasApproval: true,
    },
    borrow: {
      asset: assets.ethereumV3Market.cbETH,
      amount: 9999,
      isMaxAmount: true,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: true,
    },
    deposit2: {
      asset: assets.ethereumV3Market.cbETH,
      amount: 100,
      hasApproval: false,
      isMaxAmount: true,
    },
    repay: {
      asset: assets.ethereumV3Market.cbETH,
      apyType: constants.apyType.variable,
      amount: 5,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
  },
};

describe('E-MODE SPEC, ETHEREUM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAEthereumV3Fork({ v3: true });
  describe('Prepare min health factor state, with stable coins', () => {
    supply(testData.testCases.deposit1, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    supply(testData.testCases.deposit2, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.09 }, skipTestState);
  });
  describe('Turn on E-Mode and verify increase of health factor', () => {
    emodeActivating({ turnOn: true, emodeName: 'ETH correlated' }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.09, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
  });
  describe('Turn off E-mode and verify decrease of health factor', () => {
    emodeActivating({ turnOn: false }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.09 }, skipTestState);
  });
});
