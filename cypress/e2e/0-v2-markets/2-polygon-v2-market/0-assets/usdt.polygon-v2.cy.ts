import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constants.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  changeBorrowTypeBlocked,
  dashboardAssetValuesVerification,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.polygonMarket.MATIC,
    amount: 800,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.polygonMarket.USDT,
      amount: 25,
      hasApproval: true,
    },
    deposit: {
      asset: assets.polygonMarket.USDT,
      amount: 10,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.polygonMarket.USDT,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.polygonMarket.USDT,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: false,
        repayOption: constants.repayType.collateral,
      },
    ],
    withdraw: {
      asset: assets.polygonMarket.USDT,
      isCollateral: false,
      amount: 1,
      hasApproval: true,
    },
    checkDisabledCollateral: {
      asset: assets.polygonMarket.USDT,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.USDT.shortName,
        wrapped: assets.polygonMarket.USDT.wrapped,
        amount: 9.0,
        collateralType: constants.collateralType.isNotCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonMarket.USDT.shortName,
        wrapped: assets.polygonMarket.USDT.wrapped,
        amount: 21.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('USDT INTEGRATION SPEC, POLYGON MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({});

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  changeBorrowTypeBlocked(testData.testCases.checkDisabledCollateral, skipTestState);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
