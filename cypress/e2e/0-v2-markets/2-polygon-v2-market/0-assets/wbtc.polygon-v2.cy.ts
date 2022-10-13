import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.polygonMarket.MATIC,
    amount: 5000,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.polygonMarket.WBTC,
      amount: 0.01,
      hasApproval: true,
    },
    deposit: {
      asset: assets.polygonMarket.WBTC,
      amount: 0.006,
      hasApproval: false,
    },
    repay: {
      asset: assets.polygonMarket.WBTC,
      apyType: constants.apyType.variable,
      amount: 0.001,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.polygonMarket.WBTC,
      isCollateral: true,
      amount: 0.001,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.WBTC.shortName,
        wrapped: assets.polygonMarket.WBTC.wrapped,
        amount: 0.005,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonMarket.WBTC.shortName,
        wrapped: assets.polygonMarket.WBTC.wrapped,
        amount: 0.009,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('WBTC INTEGRATION SPEC, POLYGON V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({});

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  repay(testData.testCases.repay, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
