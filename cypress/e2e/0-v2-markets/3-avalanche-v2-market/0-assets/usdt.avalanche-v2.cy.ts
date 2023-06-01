import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  changeBorrowTypeBlocked,
  dashboardAssetValuesVerification,
  switchApyBlocked,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.avalancheMarket.AVAX,
    amount: 800,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.avalancheMarket.USDT,
      amount: 25,
      hasApproval: true,
    },
    deposit: {
      asset: assets.avalancheMarket.USDT,
      amount: 10,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.avalancheMarket.USDT,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: false,
        repayOption: constants.repayType.collateral,
      },
      {
        asset: assets.avalancheMarket.USDT,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.avalancheMarket.USDT,
      isCollateral: false,
      amount: 1,
      hasApproval: true,
    },
    checkDisabledApy: {
      asset: assets.avalancheMarket.USDT,
      apyType: constants.apyType.variable,
    },
    checkBorrowTypeBlocked: {
      asset: assets.avalancheMarket.USDT,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.USDT.shortName,
        wrapped: assets.avalancheMarket.USDT.wrapped,
        amount: 9.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheMarket.USDT.shortName,
        wrapped: assets.avalancheMarket.USDT.wrapped,
        amount: 21.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('USDT INTEGRATION SPEC, AVALANCHE V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({});

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  switchApyBlocked(testData.testCases.checkDisabledApy, skipTestState);
  changeBorrowTypeBlocked(testData.testCases.checkBorrowTypeBlocked, skipTestState);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
