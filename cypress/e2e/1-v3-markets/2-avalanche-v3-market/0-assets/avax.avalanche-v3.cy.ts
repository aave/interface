import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../../support/steps/configuration.steps';
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
      asset: assets.avalancheV3Market.AVAX,
      amount: 1.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.avalancheV3Market.AVAX,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.avalancheV3Market.AVAX,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.avalancheV3Market.AVAX,
        isCollateralType: true,
      },
    },
    borrow: [
      {
        asset: assets.avalancheV3Market.AVAX,
        amount: 0.06,
        apyType: constants.borrowAPYType.default,
        hasApproval: false,
      },
    ],
    withdraw: [
      {
        asset: assets.avalancheV3Market.AVAX,
        isCollateral: true,
        amount: 0.01,
        hasApproval: false,
      },
      {
        asset: assets.avalancheV3Market.AVAX,
        isCollateral: true,
        amount: 0.01,
        hasApproval: true,
        forWrapped: true,
      },
    ],
    repay: [
      {
        asset: assets.avalancheV3Market.AVAX,
        apyType: constants.apyType.variable,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.avalancheV3Market.AVAX,
        apyType: constants.apyType.variable,
        repayableAsset: assets.avalancheV3Market.WAVAX,
        amount: 0.01,
        hasApproval: false,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.avalancheV3Market.AVAX,
        apyType: constants.apyType.variable,
        repayableAsset: assets.avalancheV3Market.aWAVAX,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheV3Market.AVAX.shortName,
        amount: 1.06,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheV3Market.AVAX.shortName,
        amount: 0.03,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};
//skip due borrow is full
describe.skip('AVAX INTEGRATION SPEC, AVALANCHE V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ market: 'fork_proto_avalanche_v3', v3: true });

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
