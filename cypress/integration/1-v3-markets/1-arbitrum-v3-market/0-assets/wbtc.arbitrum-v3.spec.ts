import { configEnvWithTenderlyArbitrumFork } from '../../../../support/steps/configuration.steps';
import {
  supply,
  borrow,
  repay,
  withdraw,
  changeBorrowType,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import { skipState } from '../../../../support/steps/common';
import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';

const testData = {
  depositBaseAmount: {
    asset: assets.arbitrumMarket.ETH,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.arbitrumMarket.WBTC,
        amount: 0.025,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.arbitrumMarket.WBTC,
        amount: 0.025,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.arbitrumMarket.WBTC,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.arbitrumMarket.WBTC,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.arbitrumMarket.WBTC,
      amount: 0.0101,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.arbitrumMarket.WBTC,
        apyType: constants.apyType.stable,
        amount: 0.002,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.arbitrumMarket.WBTC,
        apyType: constants.apyType.stable,
        repayableAsset: assets.arbitrumMarket.aWBTC,
        amount: 0.002,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.arbitrumMarket.WBTC,
      isCollateral: true,
      amount: 0.001,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.arbitrumMarket.WBTC.shortName,
        amount: 0.007,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.arbitrumMarket.WBTC.shortName,
        amount: 0.046,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe('WBTC INTEGRATION SPEC, ARBITRUM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyArbitrumFork({ v3: true });

  supply(testData.depositBaseAmount, skipTestState, true);
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
