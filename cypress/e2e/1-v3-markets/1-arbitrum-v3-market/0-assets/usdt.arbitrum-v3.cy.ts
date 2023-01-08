import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constants.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyArbitrumFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeBorrowType,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchCollateralBlocked,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.arbitrumMarket.ETH,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.arbitrumMarket.USDT,
        amount: 25,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.arbitrumMarket.USDT,
        amount: 25,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.arbitrumMarket.USDT,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.arbitrumMarket.USDT,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.arbitrumMarket.USDT,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.arbitrumMarket.USDT,
        apyType: constants.apyType.stable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.arbitrumMarket.USDT,
        apyType: constants.apyType.stable,
        repayableAsset: assets.arbitrumMarket.aUSDT,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.arbitrumMarket.USDT,
      isCollateral: false,
      amount: 1,
      hasApproval: true,
    },
    checkBorrowTypeBlocked: {
      asset: assets.arbitrumMarket.USDT,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.arbitrumMarket.USDT.shortName,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.arbitrumMarket.USDT.shortName,
        amount: 46.0,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe('USDT INTEGRATION SPEC, ARBITRUM V3 MARKET', () => {
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
  switchCollateralBlocked(testData.testCases.checkBorrowTypeBlocked, skipTestState);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
