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
        asset: assets.arbitrumMarket.WBTC,
        amount: 0.05,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.arbitrumMarket.WBTC,
      amount: 0.0101,
      hasApproval: false,
    },
    checkDisabledApy: {
      asset: assets.arbitrumMarket.WBTC,
      apyType: constants.apyType.variable,
    },
    repay: [
      {
        asset: assets.arbitrumMarket.WBTC,
        apyType: constants.apyType.variable,
        amount: 0.002,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.arbitrumMarket.WBTC,
        apyType: constants.apyType.variable,
        repayableAsset: assets.arbitrumMarket.aWBTC,
        amount: 0.002,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.arbitrumMarket.WBTC,
      isCollateral: true,
      amount: 0.001,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.arbitrumMarket.WBTC.shortName,
        amount: 0.007,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.arbitrumMarket.WBTC.shortName,
        amount: 0.046,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('WBTC INTEGRATION SPEC, ARBITRUM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyArbitrumFork({
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
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
