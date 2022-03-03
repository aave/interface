import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import {
  supply,
  borrow,
  repay,
  withdraw,
  changeCollateral,
  changeCollateralNegative,
} from '../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
} from '../../../support/steps/verification.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';

const testData = {
  testCases: {
    deposit: {
      asset: assets.aaveMarket.ETH,
      amount: 1.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.aaveMarket.ETH,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.aaveMarket.ETH,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.aaveMarket.ETH,
        collateralType: constants.collateralType.isCollateral,
      },
    },
    borrow: {
      asset: assets.aaveMarket.ETH,
      amount: 0.04,
      hasApproval: true,
    },
    repay: {
      asset: assets.aaveMarket.ETH,
      amount: 0.01,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.aaveMarket.ETH,
      amount: 0.01,
      hasApproval: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        asset: assets.aaveMarket.ETH.shortName,
        amount: 0.08,
        collateralType: constants.collateralType.isCollateral,
      },
      {
        type: constants.dashboardTypes.borrow,
        asset: assets.aaveMarket.ETH.shortName,
        amount: 0.03,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('MATIC INTEGRATION SPEC, POLYGON V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});

  supply(testData.testCases.deposit, skipTestState, true);
  describe('Check Collateral switching', () => {
    changeCollateral(testData.testCases.collateral.switchOff, skipTestState, false);
    borrowsUnavailable(skipTestState);
    changeCollateral(testData.testCases.collateral.switchOn, skipTestState, false);
  });
  borrow(testData.testCases.borrow, skipTestState, true);
  // changeBorrowTypeNegative(testData.switchBorrowType, skipTestState, false);
  changeCollateralNegative(testData.testCases.collateral.switchNegative, skipTestState, false);
  repay(testData.testCases.repay, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
