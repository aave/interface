import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAEthereumV3Fork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.ethereumV3Market.ETH,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.ethereumV3Market.wstETH,
        amount: 0.5,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.ethereumV3Market.wstETH,
      amount: 0.10001,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.ethereumV3Market.wstETH,
        apyType: constants.apyType.variable,
        amount: 0.02,
        hasApproval: false,
        repayOption: constants.repayType.collateral,
      },
      {
        asset: assets.ethereumV3Market.wstETH,
        apyType: constants.apyType.variable,
        amount: 0.02,
        hasApproval: false,
        repayOption: constants.repayType.wallet,
      },
      {
        asset: assets.ethereumV3Market.wstETH,
        apyType: constants.apyType.variable,
        repayableAsset: assets.ethereumV3Market.awstETH,
        amount: 0.02,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.ethereumV3Market.wstETH,
      isCollateral: true,
      amount: 0.001,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.ethereumV3Market.wstETH.shortName,
        amount: 0.07,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.ethereumV3Market.wstETH.shortName,
        amount: 0.44,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('wstETH INTEGRATION SPEC, ETHEREUM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAEthereumV3Fork({ v3: true });

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
