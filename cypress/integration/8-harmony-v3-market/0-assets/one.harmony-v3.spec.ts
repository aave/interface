import { configEnvWithTenderlyHarmonyTestnetFork } from '../../../support/steps/configuration.steps';
import {
  supply,
  borrow,
  repay,
  withdraw,
  changeCollateral,
  changeCollateralNegative,
} from '../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
} from '../../../support/steps/verification.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';

const testData = {
  testCases: {
    deposit: {
      asset: assets.harmonyMarket.ONE,
      amount: 1.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.harmonyMarket.ONE,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.harmonyMarket.ONE,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.harmonyMarket.ONE,
        isCollateralType: true,
      },
    },
    borrow: [
      {
        asset: assets.harmonyMarket.ONE,
        amount: 0.06,
        apyType: constants.borrowAPYType.variable,
        hasApproval: false,
      },
    ],
    withdraw: [
      {
        asset: assets.harmonyMarket.ONE,
        isCollateral: true,
        amount: 0.01,
        hasApproval: false,
      },
      {
        asset: assets.harmonyMarket.ONE,
        isCollateral: true,
        amount: 0.01,
        hasApproval: true,
        forWrapped: true,
      },
    ],
    repay: [
      {
        asset: assets.harmonyMarket.ONE,
        apyType: constants.apyType.variable,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.harmonyMarket.ONE,
        apyType: constants.apyType.variable,
        repayableAsset: assets.harmonyMarket.WONE,
        amount: 0.01,
        hasApproval: false,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.harmonyMarket.ONE,
        apyType: constants.apyType.variable,
        repayableAsset: assets.harmonyMarket.aONE,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.harmonyMarket.ONE.shortName,
        wrapped: assets.harmonyMarket.ONE.wrapped,
        amount: 1.07,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.harmonyMarket.ONE.shortName,
        wrapped: assets.harmonyMarket.ONE.wrapped,
        amount: 0.02,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('FTM INTEGRATION SPEC, HARMONY V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyHarmonyTestnetFork({});

  supply(testData.testCases.deposit, skipTestState, true);
  describe('Check Collateral switching', () => {
    changeCollateral(testData.testCases.collateral.switchOff, skipTestState, false);
    borrowsUnavailable(skipTestState);
    changeCollateral(testData.testCases.collateral.switchOn, skipTestState, false);
  });
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  changeCollateralNegative(testData.testCases.collateral.switchNegative, skipTestState, false);
  testData.testCases.withdraw.forEach((withdrawCase) => {
    withdraw(withdrawCase, skipTestState, false);
  });
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
