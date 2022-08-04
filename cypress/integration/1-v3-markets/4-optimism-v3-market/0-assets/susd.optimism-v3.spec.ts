import { configEnvWithTenderlyOptimismFork } from '../../../../support/steps/configuration.steps';
import { supply, borrow, repay, withdraw } from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import { skipState } from '../../../../support/steps/common';
import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';

const testData = {
  depositBaseAmount: {
    asset: assets.optimismMarket.ETH,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.optimismMarket.sUSD,
        amount: 25,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.optimismMarket.sUSD,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.optimismMarket.sUSD,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.optimismMarket.sUSD,
        apyType: constants.apyType.variable,
        repayableAsset: assets.optimismMarket.asUSD,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.optimismMarket.sUSD,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.optimismMarket.sUSD.shortName,
        amount: 7.0,
        collateralType: constants.collateralType.isNotCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.optimismMarket.sUSD.shortName,
        amount: 21.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('sUSD INTEGRATION SPEC, OPTIMISM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyOptimismFork({ v3: true });

  supply(testData.depositBaseAmount, skipTestState, true);
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
