import { RequestedTokens, tokenSet } from 'cypress/support/helpers/token.helper';

import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
import { borrow, swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const tokensToRequest: RequestedTokens = {
  aAVAXAvalancheV3: 100,
};

const testData = {
  borrow: {
    asset: assets.avalancheV3Market.DAI,
    amount: 50,
    apyType: constants.borrowAPYType.stable,
    hasApproval: true,
  },
  swap: {
    fromAsset: assets.avalancheV3Market.DAI,
    toAsset: assets.avalancheV3Market.USDC,
    isBorrowed: true,
    isVariableBorrowedAPY: false,
    amount: 200,
    hasApproval: false,
    isMaxAmount: true,
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheV3Market.USDC.shortName,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('SWITCH BORROWED, AVALANCHE V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({
    market: 'fork_proto_avalanche_v3',
    tokens: tokenSet(tokensToRequest),
  });
  borrow(testData.borrow, skipTestState, true);
  swap(testData.swap, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
