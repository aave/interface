import { configEnvWithTenderlyAvalancheFork } from '../../../../support/steps/configuration.steps';
import { supply, borrow, repay, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchApyBlocked,
} from '../../../../support/steps/verification.steps';
import { skipState } from '../../../../support/steps/common';
import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';

const testData = {
  depositBaseAmount: {
    asset: assets.avalancheMarket.AVAX,
    amount: 800,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.avalancheMarket.USDC,
      amount: 25,
      hasApproval: true,
    },
    deposit: {
      asset: assets.avalancheMarket.USDC,
      amount: 10,
      hasApproval: false,
    },
    repay: {
      asset: assets.avalancheMarket.USDC,
      apyType: constants.apyType.variable,
      amount: 2,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.avalancheMarket.USDC,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
    checkDisabledApy: {
      asset: assets.avalancheMarket.USDC,
      apyType: constants.apyType.variable,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.USDC.shortName,
        wrapped: assets.avalancheMarket.USDC.wrapped,
        amount: 9.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheMarket.USDC.shortName,
        wrapped: assets.avalancheMarket.USDC.wrapped,
        amount: 23.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('USDC INTEGRATION SPEC, AVALANCHE V2 MARKET', () => {
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
