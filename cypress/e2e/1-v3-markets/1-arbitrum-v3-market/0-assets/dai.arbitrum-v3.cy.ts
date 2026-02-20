import { RequestedTokens, tokenSet } from 'cypress/support/helpers/token.helper';

import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyArbitrumFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';

const tokensToRequest: RequestedTokens = {
  aETHArbitrumV3: 100,
};

const testData = {
  testCases: {
    borrow: [
      {
        asset: assets.arbitrumMarket.DAI,
        amount: 25,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.arbitrumMarket.DAI,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.arbitrumMarket.DAI,
        apyType: constants.apyType.stable,
        repayableAsset: assets.arbitrumMarket.aDAI,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.arbitrumMarket.DAI,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
    // withdrawAndSwitch: {
    //   fromAsset: assets.arbitrumMarket.DAI,
    //   toAsset: assets.arbitrumMarket.USDC,
    //   isCollateralFromAsset: true,
    //   amount: 5,
    //   hasApproval: false,
    // },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.arbitrumMarket.DAI.shortName,
        amount: 7.1,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.arbitrumMarket.DAI.shortName,
        amount: 23.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('DAI INTEGRATION SPEC, ARBITRUM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyArbitrumFork({
    tokens: tokenSet(tokensToRequest),
  });
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  // withdrawAndSwitch(testData.testCases.withdrawAndSwitch, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
