import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyBaseFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.baseV3Market.ETH,
    amount: 5,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.baseV3Market.USDbC,
        amount: 50,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.baseV3Market.USDbC,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      //skip while swap is not enabled
      // {
      //   asset: assets.baseV3Market.USDbC,
      //   apyType: constants.apyType.variable,
      //   amount: 2,
      //   hasApproval: false,
      //   repayOption: constants.repayType.collateral,
      // },
      // {
      //   asset: assets.baseV3Market.USDbC,
      //   apyType: constants.apyType.variable,
      //   amount: 2,
      //   hasApproval: true,
      //   repayOption: constants.repayType.wallet,
      // },
      {
        asset: assets.baseV3Market.USDbC,
        apyType: constants.apyType.variable,
        repayableAsset: assets.baseV3Market.aUSDbC,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.baseV3Market.USDbC,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.baseV3Market.USDbC.shortName,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.baseV3Market.USDbC.shortName,
        amount: 48.0, //46.0
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('USDbC INTEGRATION SPEC, BASE V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyBaseFork({ v3: true });

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
