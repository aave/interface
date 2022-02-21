import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
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
      asset: assets.polygonMarket.MATIC,
      amount: 0.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.polygonMarket.MATIC,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.polygonMarket.MATIC,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.polygonMarket.MATIC,
        collateralType: constants.collateralType.isCollateral,
      },
    },
    borrow: {
      asset: assets.polygonMarket.MATIC,
      amount: 0.04,
      apyType: constants.borrowAPYType.variable,
      hasApproval: false,
    },
    repay: {
      asset: assets.polygonMarket.MATIC,
      amount: 0.01,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.polygonMarket.MATIC,
      amount: 0.01,
      hasApproval: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        asset: assets.polygonMarket.MATIC.shortName,
        amount: 0.08,
        collateralType: constants.collateralType.isCollateral,
      },
      {
        type: constants.dashboardTypes.borrow,
        asset: assets.polygonMarket.MATIC.shortName,
        amount: 0.03,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('MATIC INTEGRATION SPEC, POLYGON MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({});

  supply(testData.testCases.deposit, skipTestState, true);
  describe('Check Collateral switching', () => {
    changeCollateral(testData.testCases.collateral.switchOff, skipTestState, false);
    borrowsUnavailable(skipTestState);
    changeCollateral(testData.testCases.collateral.switchOn, skipTestState, false);
  });
  borrow(testData.testCases.borrow, skipTestState, true);
  changeCollateralNegative(testData.testCases.collateral.switchNegative, skipTestState, false);
  repay(testData.testCases.repay, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
