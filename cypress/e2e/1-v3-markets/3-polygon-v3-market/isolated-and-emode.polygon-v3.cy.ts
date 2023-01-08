import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constants.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { borrow, emodeActivating, supply, swap } from '../../../support/steps/main.steps';
import {
  borrowsAvailable,
  checkDashboardHealthFactor,
  dashboardAssetValuesVerification,
  switchCollateralBlockedInModal,
  verifyCountOfBorrowAssets,
} from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    depositMATIC: {
      asset: assets.polygonV3Market.MATIC,
      amount: 20,
      hasApproval: true,
    },
    swapMATIC: {
      fromAsset: assets.polygonV3Market.MATIC,
      toAsset: assets.polygonV3Market.USDT,
      isCollateralFromAsset: true,
      amount: 10,
      isMaxAmount: true,
      hasApproval: false,
    },
    borrow: {
      asset: assets.polygonV3Market.USDT,
      amount: 28,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isMaxAmount: true,
      isRisk: true,
    },
    checkBorrowTypeBlocked1: {
      asset: assets.polygonV3Market.USDT,
      isCollateralType: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonV3Market.USDT.shortName,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
  IsolatedModeAssets: [
    assets.polygonV3Market.DAI,
    assets.polygonV3Market.USDT,
    assets.polygonV3Market.USDC,
  ],
};
//skip due unstable swap and polygon at all
//TODO: need to refactor without swap
describe.skip('ISOLATED MODE with EMODE SPEC, POLYGON V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ market: 'fork_proto_polygon_v3', v3: true });
  describe('Get isolated asset', () => {
    supply(testData.testCases.depositMATIC, skipTestState, true);
    swap(testData.testCases.swapMATIC, skipTestState, true); //swap don't work
  });
  describe('Verify isolated mode property', () => {
    dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
    verifyCountOfBorrowAssets({ assets: testData.IsolatedModeAssets }, skipTestState);
  });
  describe('Verify borrowing in isolated mode', () => {
    borrow(testData.testCases.borrow, skipTestState, true);
    switchCollateralBlockedInModal(testData.testCases.checkBorrowTypeBlocked1, skipTestState);
  });
  describe('Turn on E-Mode and verify increase of health factor', () => {
    emodeActivating(
      { turnOn: true, multipleEmodes: true, emodeOption: 'Stablecoin' },
      skipTestState,
      true
    );
    checkDashboardHealthFactor({ valueFrom: 1.07, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
    verifyCountOfBorrowAssets({ assets: testData.IsolatedModeAssets }, skipTestState);
  });
  describe('Verify additional borrowing with active e-mode', () => {
    borrow(testData.testCases.borrow, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  });
});
