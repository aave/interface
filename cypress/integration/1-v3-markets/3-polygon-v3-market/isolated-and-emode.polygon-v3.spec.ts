import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { supply, borrow, swap, emodeActivating } from '../../../support/steps/main.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import {
  verifyCountOfBorrowAssets,
  dashboardAssetValuesVerification,
  switchCollateralBlockedInModal,
  checkDashboardHealthFactor,
  borrowsAvailable,
} from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    depositMATIC: {
      asset: assets.polygonV3Market.MATIC,
      amount: 5000,
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
      amount: 10,
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

describe('ISOLATED MODE with EMODE SPEC, POLYGON V3 MARKET', () => {
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
    emodeActivating({ turnOn: true }, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.07, valueTo: 1000 }, skipTestState);
    borrowsAvailable(skipTestState);
    verifyCountOfBorrowAssets({ assets: testData.IsolatedModeAssets }, skipTestState);
  });
  describe('Verify additional borrowing with active e-mode', () => {
    borrow(testData.testCases.borrow, skipTestState, true);
    checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.07 }, skipTestState);
  });
});
