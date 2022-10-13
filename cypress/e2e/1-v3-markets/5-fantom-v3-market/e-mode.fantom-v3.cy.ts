import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyFantomFork } from '../../../support/steps/configuration.steps';
import { borrow, emodeActivating, supply } from '../../../support/steps/main.steps';
import {
  borrowsAvailable,
  checkDashboardHealthFactor,
  verifyCountOfBorrowAssets,
} from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.fantomMarket.FTM,
      amount: 1000,
      hasApproval: true,
    },
    borrow1: {
      asset: assets.fantomMarket.DAI,
      amount: 9999,
      isMaxAmount: true,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: false,
    },
    deposit2: {
      asset: assets.fantomMarket.DAI,
      amount: 100,
      hasApproval: false,
      isMaxAmount: true,
    },
    borrow2: {
      asset: assets.fantomMarket.DAI,
      amount: 9999,
      isMaxAmount: true,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: true,
    },
    repay: {
      asset: assets.fantomMarket.DAI,
      apyType: constants.apyType.variable,
      amount: 5,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    eModeAssets: [assets.fantomMarket.DAI, assets.fantomMarket.USDT, assets.fantomMarket.USDC],
  },
};

describe('E-MODE SPEC, FANTOM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomFork({ v3: true });
  describe('Prepare min health factor state, with stable coins', () => {
    supply(testData.testCases.deposit1, skipTestState, true);
    borrow(testData.testCases.borrow1, skipTestState, true);
    supply(testData.testCases.deposit2, skipTestState, true);
    borrow(testData.testCases.borrow2, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.59 }, skipTestState);
  });
  describe('Turn on E-Mode and verify increase of health factor', () => {
    emodeActivating({ turnOn: true }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.52, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
    verifyCountOfBorrowAssets({ assets: testData.testCases.eModeAssets }, skipTestState);
  });
  describe('Trun off E-mode and verify decrease of health factor', () => {
    emodeActivating({ turnOn: false }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.59 }, skipTestState);
  });
});
