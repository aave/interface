import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
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
    depositAVAX: {
      asset: assets.avalancheV3Market.AVAX,
      amount: 10,
      hasApproval: true,
    },
    swapAVAX: {
      fromAsset: assets.avalancheV3Market.AVAX,
      toAsset: assets.avalancheV3Market.USDT,
      isCollateralFromAsset: true,
      amount: 10,
      isMaxAmount: true,
      hasApproval: false,
    },
    borrow: {
      asset: assets.avalancheV3Market.USDT,
      amount: 10,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
      isRisk: false,
    },
    checkBorrowTypeBlocked1: {
      asset: assets.avalancheV3Market.USDT,
      isCollateralType: true,
    },
    checkBorrowTypeBlocked2: {
      asset: assets.avalancheV3Market.USDT,
      isCollateralType: false,
    },
    repay: {
      asset: assets.avalancheV3Market.USDT,
      repayableAsset: assets.avalancheV3Market.aUSDT,
      apyType: constants.apyType.variable,
      amount: 2,
      isMaxAmount: true,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    switchCollateralForUSDTOn: {
      asset: assets.avalancheV3Market.USDT,
      isCollateralType: false,
      hasApproval: true,
    },
    switchCollateralForUSDT: {
      asset: assets.avalancheV3Market.USDT,
      isCollateralType: true,
      hasApproval: true,
    },
    switchCollateralForAVAX: {
      asset: assets.avalancheV3Market.AVAX,
      isCollateralType: true,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheV3Market.USDT.shortName,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
  IsolatedModeAssets: [
    assets.avalancheV3Market.DAI,
    assets.avalancheV3Market.USDT,
    assets.avalancheV3Market.USDC,
  ],
};

describe.skip('ISOLATED MODE SPEC, AVALANCHE V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ market: 'fork_proto_avalanche_v3', v3: true });
  describe('Get isolated asset', () => {
    supply(testData.testCases.depositAVAX, skipTestState, true);
    swap(testData.testCases.swapAVAX, skipTestState, true);
  });
  describe(`Switch on isolated mode`, () => {
    changeCollateral(testData.testCases.switchCollateralForUSDTOn, skipTestState, true);
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
    supply(testData.testCases.depositAVAX, skipTestState, true);
    switchCollateralBlocked(testData.testCases.checkBorrowTypeBlocked2, skipTestState);
  });
});
