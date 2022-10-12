import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
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
      asset: assets.avalancheMarket.WETH,
      amount: 0.1,
      hasApproval: true,
    },
    deposit: {
      asset: assets.avalancheMarket.WETH,
      amount: 0.06,
      hasApproval: false,
    },
    repay: {
      asset: assets.avalancheMarket.WETH,
      apyType: constants.apyType.variable,
      amount: 0.01,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.avalancheMarket.WETH,
      isCollateral: true,
      amount: 0.01,
      hasApproval: true,
    },
    checkDisabledApy: {
      asset: assets.avalancheMarket.WETH,
      apyType: constants.apyType.variable,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.WETH.shortName,
        wrapped: assets.avalancheMarket.WETH.wrapped,
        amount: 0.05,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheMarket.WETH.shortName,
        wrapped: assets.avalancheMarket.WETH.wrapped,
        amount: 0.09,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('WETH INTEGRATION SPEC, AVALANCHE V2 MARKET', () => {
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
