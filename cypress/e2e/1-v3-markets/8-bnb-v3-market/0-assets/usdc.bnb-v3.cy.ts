import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyBnbFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aBNBBnbV3: 2,
};

const testData = {
  testCases: {
    borrow: [
      {
        asset: assets.bnbV3Market.USDC,
        amount: 50,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.bnbV3Market.USDC,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      //skip while swap is not enabled
      {
        asset: assets.bnbV3Market.USDC,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: false,
        repayOption: constants.repayType.collateral,
      },
      {
        asset: assets.bnbV3Market.USDC,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.wallet,
      },
      {
        asset: assets.bnbV3Market.USDC,
        apyType: constants.apyType.variable,
        repayableAsset: assets.bnbV3Market.aUSDC,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.bnbV3Market.USDC,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.bnbV3Market.USDC.shortName,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.bnbV3Market.USDC.shortName,
        amount: 44.0, //46.0
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe.skip('USDbC INTEGRATION SPEC, BASE V3 MARKET', () => {
  const skipTestState = skipState(true);
  configEnvWithTenderlyBnbFork({
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
