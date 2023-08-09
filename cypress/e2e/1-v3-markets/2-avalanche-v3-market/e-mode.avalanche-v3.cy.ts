import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
import { borrow, emodeActivating, supply } from '../../../support/steps/main.steps';
import {
  borrowsAvailable,
  checkDashboardHealthFactor,
  checkEmodeActivatingDisabled,
} from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.avalancheV3Market.AVAX,
      amount: 10,
      hasApproval: true,
    },
    borrow: {
      asset: assets.avalancheV3Market.DAI,
      amount: 9999,
      isMaxAmount: true,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: true,
    },
    deposit2: {
      asset: assets.avalancheV3Market.DAI,
      amount: 100,
      hasApproval: false,
      isMaxAmount: true,
    },
    repay: {
      asset: assets.avalancheV3Market.DAI,
      apyType: constants.apyType.variable,
      amount: 5,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    eModeAssets: [
      assets.avalancheV3Market.DAI,
      // assets.avalancheV3Market.USDT,
      assets.avalancheV3Market.USDC,
      assets.avalancheV3Market.FRAX,
      assets.avalancheV3Market.MAI,
    ],
  },
};

describe('E-MODE SPEC, AVALANCHE V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ market: 'fork_proto_avalanche_v3', v3: true });
  describe('Prepare min health factor state, with stable coins', () => {
    supply(testData.testCases.deposit1, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    supply(testData.testCases.deposit2, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.08 }, skipTestState);
  });
  describe('Turn on E-Mode and verify increase of health factor', () => {
    emodeActivating(
      { turnOn: true, multipleEmodes: true, emodeOption: 'Stablecoin' },
      skipTestState,
      true
    );
    checkDashboardHealthFactor({ valueFrom: 1.07, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
    // verifyCountOfBorrowAssets({ assets: testData.testCases.eModeAssets }, skipTestState); temporary skip this step
  });
  describe('Turn off E-mode and verify decrease of health factor', () => {
    emodeActivating({ turnOn: false, multipleEmodes: true }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.08 }, skipTestState);
  });
  describe('Turn off E-mode blocked with low health factor', () => {
    emodeActivating(
      { turnOn: true, multipleEmodes: true, emodeOption: 'Stablecoin' },
      skipTestState,
      true
    );
    borrow(testData.testCases.borrow, skipTestState, true);
    checkEmodeActivatingDisabled({ turnOn: false }, skipTestState);
  });
});
