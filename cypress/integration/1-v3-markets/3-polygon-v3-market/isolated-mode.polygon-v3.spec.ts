import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { supply, borrow, swap, repay, changeCollateral } from '../../../support/steps/main.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import {
  verifyCountOfBorrowAssets,
  dashboardAssetValuesVerification,
  switchCollateralBlocked,
  borrowsUnavailable,
  switchCollateralBlockedInModal,
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
      isRisk: false,
    },
    checkBorrowTypeBlocked1: {
      asset: assets.polygonV3Market.USDT,
      isCollateralType: true,
    },
    checkBorrowTypeBlocked2: {
      asset: assets.polygonV3Market.USDT,
      isCollateralType: false,
    },
    repay: {
      asset: assets.polygonV3Market.USDT,
      apyType: constants.apyType.variable,
      amount: 2,
      isMaxAmount: true,
      hasApproval: false,
      repayOption: constants.repayType.default,
    },
    switchCollateralForUSDT: {
      asset: assets.polygonV3Market.USDT,
      isCollateralType: true,
      hasApproval: true,
    },
    switchCollateralForMATIC: {
      asset: assets.polygonV3Market.MATIC,
      isCollateralType: true,
      hasApproval: true,
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

describe('ISOLATED MODE SPEC, POLYGON V3 MARKET', () => {
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
    repay(testData.testCases.repay, skipTestState, false);
  });
  describe('Switch off isolated mode', () => {
    changeCollateral(testData.testCases.switchCollateralForUSDT, skipTestState, false);
    borrowsUnavailable(skipTestState);
    supply(testData.testCases.depositMATIC, skipTestState, true);
    switchCollateralBlocked(testData.testCases.checkBorrowTypeBlocked2, skipTestState);
  });
});
