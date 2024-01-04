import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchApyBlocked,
} from '../../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aAVAXAvalancheV2: 800,
};

const testData = {
  testCases: {
    borrow: {
      asset: assets.avalancheMarket.DAI,
      amount: 25,
      hasApproval: true,
    },
    deposit: {
      asset: assets.avalancheMarket.DAI,
      amount: 10,
      hasApproval: false,
    },
    repay: {
      asset: assets.avalancheMarket.DAI,
      apyType: constants.apyType.variable,
      amount: 2,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.avalancheMarket.DAI,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
    checkDisabledApy: {
      asset: assets.avalancheMarket.DAI,
      apyType: constants.apyType.variable,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.DAI.shortName,
        wrapped: assets.avalancheMarket.DAI.wrapped,
        amount: 9.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheMarket.DAI.shortName,
        wrapped: assets.avalancheMarket.DAI.wrapped,
        amount: 23.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('DAI INTEGRATION SPEC, AVALANCHE V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ tokens: tokenSet(tokensToRequest) });
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  repay(testData.testCases.repay, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  switchApyBlocked(testData.testCases.checkDisabledApy, skipTestState);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
