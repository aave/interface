import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
import { swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aAVAXAvalancheV2: 100,
};

const testData = {
  swap: [
    {
      fromAsset: assets.avalancheMarket.AVAX,
      toAsset: assets.avalancheMarket.USDC,
      isCollateralFromAsset: true,
      amount: 10,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.USDC.shortName,
        wrapped: assets.avalancheMarket.USDC.wrapped,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.AVAX.shortName,
        amount: 90,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
};
//unstable
describe.skip('SWAP, AVALANCHE V2 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ tokens: tokenSet(tokensToRequest) });
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
