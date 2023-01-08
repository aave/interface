import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constants.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchApyBlocked,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.avalancheMarket.AVAX,
    amount: 5000,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.avalancheMarket.WBTC,
      amount: 0.01,
      hasApproval: true,
    },
    deposit: {
      asset: assets.avalancheMarket.WBTC,
      amount: 0.006,
      hasApproval: false,
    },
    repay: {
      asset: assets.avalancheMarket.WBTC,
      apyType: constants.apyType.variable,
      amount: 0.001,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.avalancheMarket.WBTC,
      isCollateral: true,
      amount: 0.001,
      hasApproval: true,
    },
    checkDisabledApy: {
      asset: assets.avalancheMarket.WBTC,
      apyType: constants.apyType.variable,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.WBTC.shortName,
        wrapped: assets.avalancheMarket.WBTC.wrapped,
        amount: 0.005,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheMarket.WBTC.shortName,
        wrapped: assets.avalancheMarket.WBTC.wrapped,
        amount: 0.009,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('WBTC INTEGRATION SPEC, AVALANCHE V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({});

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  repay(testData.testCases.repay, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  switchApyBlocked(testData.testCases.checkDisabledApy, skipTestState);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
