import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import {
  deposit,
  borrow,
  repay,
  withdraw,
  changeBorrowType,
} from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';

const testData = {
  depositETH: {
    asset: assets.aaveMarket.ETH,
    amount: 0.1,
    hasApproval: true,
  },
  testCases: {
    deposit: {
      asset: assets.aaveMarket.BAT,
      amount: 50,
      hasApproval: false,
    },
    borrow: [
      {
        asset: assets.aaveMarket.BAT,
        amount: 50,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.BAT,
        amount: 50,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.aaveMarket.BAT,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.BAT,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    repay: [
      {
        asset: assets.aaveMarket.BAT,
        amount: 10,
        hasApproval: true,
        repayOption: constants.repayType.wallet,
      },
      {
        asset: assets.aaveMarket.BAT,
        amount: 10,
        hasApproval: false,
        repayOption: constants.repayType.collateral,
        assetForRepay: assets.aaveMarket.BAT,
      },
    ],
    withdraw: {
      asset: assets.aaveMarket.BAT,
      amount: 10,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        asset: assets.aaveMarket.BAT.shortName,
        amount: 30,
        collateralType: constants.collateralType.isCollateral,
      },
      {
        type: constants.dashboardTypes.borrow,
        asset: assets.aaveMarket.BAT.shortName,
        amount: 80,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe('BAT INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});
  deposit(testData.depositETH, skipTestState, true);
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  testData.testCases.changeBorrowType.forEach((changeAPRCase) => {
    changeBorrowType(changeAPRCase, skipTestState, true);
  });
  deposit(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
