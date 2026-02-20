import { RequestedTokens, tokenSet } from 'cypress/support/helpers/token.helper';

import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import { swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const tokensToRequest: RequestedTokens = {
  aETHEthereumV2: 1,
};

const testData = {
  swap: [
    {
      fromAsset: assets.aaveMarket.ETH,
      toAsset: assets.aaveMarket.USDC,
      isCollateralFromAsset: true,
      amount: 0.1,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.USDC.shortName,
        wrapped: assets.aaveMarket.USDC.wrapped,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.ETH.shortName,
        amount: 0.9,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
};

describe.skip('SWAP, AAVE V2 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({ tokens: tokenSet(tokensToRequest) });
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
