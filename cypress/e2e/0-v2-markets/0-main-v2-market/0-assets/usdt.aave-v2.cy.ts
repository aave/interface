import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeBorrowType,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import {
  changeBorrowTypeBlocked,
  dashboardAssetValuesVerification,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositETH: {
    asset: assets.aaveMarket.ETH,
    amount: 0.5,
    hasApproval: true,
  },
  testCases: {
    deposit: {
      asset: assets.aaveMarket.USDT,
      amount: 50,
      hasApproval: false,
    },
    borrow: [
      {
        asset: assets.aaveMarket.USDT,
        amount: 50,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.USDT,
        amount: 50,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.aaveMarket.USDT,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.USDT,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    repay: [
      {
        asset: assets.aaveMarket.USDT,
        apyType: constants.apyType.stable,
        amount: 10,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      // {
      //   asset: assets.aaveMarket.USDT,
      //   apyType: constants.apyType.stable,
      //   amount: 10,
      //   hasApproval: false,
      //   repayOption: constants.repayType.collateral,
      //   assetForRepay: assets.aaveMarket.USDT,
      // },
    ],
    withdraw: {
      asset: assets.aaveMarket.USDT,
      isCollateral: false,
      amount: 10,
      hasApproval: true,
    },
    checkBorrowTypeBlocked: {
      asset: assets.aaveMarket.USDT,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.USDT.shortName,
        wrapped: assets.aaveMarket.USDT.wrapped,
        // amount: 30,
        amount: 40,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.USDT.shortName,
        wrapped: assets.aaveMarket.USDT.wrapped,
        // amount: 80,
        amount: 90,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe('USDT INTEGRATION SPEC, AAVE V2 MARKET', () => {
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
  changeBorrowTypeBlocked(testData.testCases.checkBorrowTypeBlocked, skipTestState);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
