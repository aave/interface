import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constants.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeBorrowType,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';

const testData = {
  depositETH: {
    asset: assets.aaveMarket.ETH,
    amount: 1,
    hasApproval: true,
  },
  testCases: {
    deposit: {
      asset: assets.aaveMarket.MKR,
      amount: 0.05,
      hasApproval: false,
    },
    borrow: [
      {
        asset: assets.aaveMarket.MKR,
        amount: 0.05,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.MKR,
        amount: 0.05,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.aaveMarket.MKR,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.MKR,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    repay: [
      {
        asset: assets.aaveMarket.MKR,
        apyType: constants.apyType.stable,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      // {
      //   asset: assets.aaveMarket.DAI,
      //   apyType: constants.apyType.stable,
      //   amount: 0.01,
      //   hasApproval: false,
      //   repayOption: constants.repayType.collateral,
      //   assetForRepay: assets.aaveMarket.BAT,
      // },
    ],
    withdraw: {
      asset: assets.aaveMarket.MKR,
      isCollateral: true,
      amount: 0.01,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.MKR.shortName,
        wrapped: assets.aaveMarket.MKR.wrapped,
        // amount: 0.03,
        amount: 0.04,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.MKR.shortName,
        wrapped: assets.aaveMarket.MKR.wrapped,
        // amount: 0.08,
        amount: 0.09,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe.skip('MKR INTEGRATION SPEC, AAVE V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});
  supply(testData.depositETH, skipTestState, true);
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
