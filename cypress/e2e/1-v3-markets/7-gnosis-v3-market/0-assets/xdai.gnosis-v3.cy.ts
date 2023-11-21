import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyGnosisFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeCollateral,
  changeCollateralNegative,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
} from '../../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit: {
      asset: assets.gnosisV3Market.xDAI,
      amount: 500,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.gnosisV3Market.xDAI,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.gnosisV3Market.xDAI,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.gnosisV3Market.xDAI,
        isCollateralType: true,
      },
    },
    borrow: [
      {
        asset: assets.gnosisV3Market.xDAI,
        amount: 100,
        apyType: constants.borrowAPYType.default,
        hasApproval: false,
      },
    ],
    withdraw: [
      {
        asset: assets.gnosisV3Market.xDAI,
        isCollateral: true,
        amount: 50,
        hasApproval: false,
      },
    ],
    repay: [
      {
        asset: assets.gnosisV3Market.xDAI,
        apyType: constants.apyType.variable,
        amount: 10,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.gnosisV3Market.xDAI,
        apyType: constants.apyType.variable,
        repayableAsset: assets.gnosisV3Market.aWXDAI,
        amount: 10,
        hasApproval: false,
        repayOption: constants.repayType.default,
      },
    ],
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.gnosisV3Market.xDAI.shortName,
        amount: 450,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.gnosisV3Market.xDAI.shortName,
        amount: 90,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('xDAI INTEGRATION SPEC, GNOSIS V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyGnosisFork({ v3: true });

  supply(testData.testCases.deposit, skipTestState, true);
  describe('Check Collateral switching', () => {
    changeCollateral(testData.testCases.collateral.switchOff, skipTestState, false);
    borrowsUnavailable(skipTestState);
    changeCollateral(testData.testCases.collateral.switchOn, skipTestState, false);
  });
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  changeCollateralNegative(testData.testCases.collateral.switchNegative, skipTestState, false);
  testData.testCases.withdraw.forEach((withdrawCase) => {
    withdraw(withdrawCase, skipTestState, false);
  });
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
