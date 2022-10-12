import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyFantomFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchApyBlocked,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.fantomMarket.FTM,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.fantomMarket.WETH,
        amount: 0.2,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.fantomMarket.WETH,
      amount: 0.101,
      hasApproval: false,
    },
    checkDisabledApy: {
      asset: assets.fantomMarket.WETH,
      apyType: constants.apyType.variable,
    },
    repay: [
      {
        asset: assets.fantomMarket.WETH,
        apyType: constants.apyType.variable,
        amount: 0.02,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.fantomMarket.WETH,
        apyType: constants.apyType.variable,
        repayableAsset: assets.fantomMarket.aWETH,
        amount: 0.02,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.fantomMarket.WETH,
      isCollateral: true,
      amount: 0.01,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.fantomMarket.WETH.shortName,
        amount: 0.07,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.fantomMarket.WETH.shortName,
        amount: 0.16,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('WETH INTEGRATION SPEC, FANTOM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomFork({ v3: true });

  supply(testData.depositBaseAmount, skipTestState, true);
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  switchApyBlocked(testData.testCases.checkDisabledApy, skipTestState);
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
