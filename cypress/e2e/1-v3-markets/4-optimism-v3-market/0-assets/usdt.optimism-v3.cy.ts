import { RequestedTokens, tokenSet } from 'cypress/support/helpers/token.helper';

import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyOptimismFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchCollateralBlocked,
} from '../../../../support/steps/verification.steps';

const tokensToRequest: RequestedTokens = {
  aETHOptimismV3: 9000,
};

const testData = {
  testCases: {
    borrow: [
      {
        asset: assets.optimismMarket.USDT,
        amount: 25,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.optimismMarket.USDT,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.optimismMarket.USDT,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.wallet,
      },
      {
        asset: assets.optimismMarket.USDT,
        apyType: constants.apyType.variable,
        repayableAsset: assets.optimismMarket.aUSDT,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.optimismMarket.USDT,
      isCollateral: false,
      amount: 1,
      hasApproval: true,
    },
    checkBorrowTypeBlocked: {
      asset: assets.optimismMarket.USDT,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.optimismMarket.USDT.shortName,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.optimismMarket.USDT.shortName,
        amount: 21.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};
// due frozen assets
describe.skip('USDT INTEGRATION SPEC, OPTIMISM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyOptimismFork({
    tokens: tokenSet(tokensToRequest),
  });
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  switchCollateralBlocked(testData.testCases.checkBorrowTypeBlocked, skipTestState);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
