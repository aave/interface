import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { borrow, emodeActivating, supply } from '../../../support/steps/main.steps';
import {
  borrowsAvailable,
  checkDashboardHealthFactor,
  checkEmodeActivatingDisabled,
  verifyCountOfBorrowAssets,
} from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit1: {
      asset: assets.polygonV3Market.MATIC,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.polygonV3Market.DAI,
      amount: 9999,
      isMaxAmount: true,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: true,
    },
    deposit2: {
      asset: assets.polygonV3Market.DAI,
      amount: 100,
      hasApproval: false,
      isMaxAmount: true,
    },
    repay: {
      asset: assets.polygonV3Market.DAI,
      apyType: constants.apyType.variable,
      amount: 5,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    eModeAssets: [
      assets.polygonV3Market.DAI,
      assets.polygonV3Market.USDT,
      assets.polygonV3Market.USDC,
      assets.polygonV3Market.EURS,
      assets.polygonV3Market.jEUR,
      assets.polygonV3Market.agEUR,
      // assets.polygonV3Market.miMATIC,
    ],
  },
};

describe('E-MODE SPEC, POLYGON V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ market: 'fork_proto_polygon_v3', v3: true });
  describe('Prepare min health factor state, with stable coins', () => {
    supply(testData.testCases.deposit1, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    supply(testData.testCases.deposit2, skipTestState, true);
    borrow(testData.testCases.borrow, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  });
  describe('Turn on E-Mode and verify increase of health factor', () => {
    emodeActivating(
      { turnOn: true, multipleEmodes: true, emodeOption: 'Stablecoin' },
      skipTestState,
      true
    );
    checkDashboardHealthFactor({ valueFrom: 1.07, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
    verifyCountOfBorrowAssets({ assets: testData.testCases.eModeAssets }, skipTestState);
  });
  describe('Turn off E-mode and verify decrease of health factor', () => {
    emodeActivating({ turnOn: false, multipleEmodes: true }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
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
