import { configEnvWithTenderlyHarmonyTestnetFork } from '../../../../support/steps/configuration.steps';
import {
  supply,
  borrow,
  repay,
  withdraw,
  changeBorrowType,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import { skipState } from '../../../../support/steps/common';
import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';

const testData = {
  depositBaseAmount: {
    asset: assets.harmonyMarket.ONE,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.harmonyMarket.USDT,
        amount: 25,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.harmonyMarket.USDT,
        amount: 25,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.harmonyMarket.USDT,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.harmonyMarket.USDT,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.harmonyMarket.USDT,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.harmonyMarket.USDT,
        apyType: constants.apyType.stable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.harmonyMarket.USDT,
        apyType: constants.apyType.stable,
        repayableAsset: assets.harmonyMarket.aUSDT,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.harmonyMarket.USDT,
      isCollateral: false,
      amount: 1,
      hasApproval: true,
    },
    checkBorrowTypeBlocked: {
      asset: assets.harmonyMarket.USDT,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.harmonyMarket.USDT.shortName,
        wrapped: assets.harmonyMarket.USDT.wrapped,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.harmonyMarket.USDT.shortName,
        wrapped: assets.harmonyMarket.USDT.wrapped,
        amount: 46.0,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe('USDT INTEGRATION SPEC, HARMONY V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyHarmonyTestnetFork({});

  supply(testData.depositBaseAmount, skipTestState, true);
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  testData.testCases.changeBorrowType.forEach((changeAPRCase) => {
    changeBorrowType(changeAPRCase, skipTestState, true);
  });
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
