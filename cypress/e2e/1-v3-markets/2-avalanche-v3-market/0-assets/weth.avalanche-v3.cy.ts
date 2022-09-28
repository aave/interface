import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchApyBlocked,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.avalancheV3Market.AVAX,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.avalancheV3Market.WETH,
        amount: 0.5,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.avalancheV3Market.WETH,
      amount: 0.101,
      hasApproval: false,
    },
    checkDisabledApy: {
      asset: assets.avalancheV3Market.WETH,
      apyType: constants.apyType.variable,
    },
    repay: [
      {
        asset: assets.avalancheV3Market.WETH,
        apyType: constants.apyType.variable,
        amount: 0.02,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.avalancheV3Market.WETH,
        apyType: constants.apyType.variable,
        repayableAsset: assets.avalancheV3Market.aWETH,
        amount: 0.02,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.avalancheV3Market.WETH,
      isCollateral: true,
      amount: 0.01,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheV3Market.WETH.shortName,
        amount: 0.07,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheV3Market.WETH.shortName,
        amount: 0.46,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('WETH INTEGRATION SPEC, AVALANCHE V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ market: 'fork_proto_avalanche_v3', v3: true });

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
