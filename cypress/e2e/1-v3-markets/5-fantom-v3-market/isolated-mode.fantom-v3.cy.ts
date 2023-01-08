import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constants.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyFantomFork } from '../../../support/steps/configuration.steps';
import { borrow, changeCollateral, repay, supply, swap } from '../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
  switchCollateralBlocked,
  switchCollateralBlockedInModal,
  verifyCountOfBorrowAssets,
} from '../../../support/steps/verification.steps';

const testData = {
  testCases: {
    depositFTM: {
      asset: assets.fantomMarket.FTM,
      amount: 1000,
      hasApproval: true,
    },
    swapFTM: {
      fromAsset: assets.fantomMarket.FTM,
      toAsset: assets.fantomMarket.USDT,
      isCollateralFromAsset: true,
      amount: 10,
      isMaxAmount: true,
      hasApproval: false,
    },
    borrow: {
      asset: assets.fantomMarket.USDT,
      amount: 10,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: false,
    },
    checkBorrowTypeBlocked1: {
      asset: assets.fantomMarket.USDT,
      isCollateralType: true,
    },
    checkBorrowTypeBlocked2: {
      asset: assets.fantomMarket.USDT,
      isCollateralType: false,
    },
    repay: {
      asset: assets.fantomMarket.USDT,
      apyType: constants.apyType.variable,
      repayableAsset: assets.fantomMarket.aUSDT,
      amount: 2,
      isMaxAmount: true,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    switchCollateralForUSDT: {
      asset: assets.fantomMarket.USDT,
      isCollateralType: true,
      hasApproval: true,
    },
    switchCollateralForFTM: {
      asset: assets.fantomMarket.FTM,
      isCollateralType: true,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.fantomMarket.USDT.shortName,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
  IsolatedModeAssets: [assets.fantomMarket.DAI, assets.fantomMarket.USDT, assets.fantomMarket.USDC],
};

describe('ISOLATED MODE SPEC, FANTOM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomFork({ v3: true });
  describe('Get isolated asset', () => {
    supply(testData.testCases.depositFTM, skipTestState, true);
    swap(testData.testCases.swapFTM, skipTestState, true);
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
    supply(testData.testCases.depositFTM, skipTestState, true);
    switchCollateralBlocked(testData.testCases.checkBorrowTypeBlocked2, skipTestState);
  });
});
