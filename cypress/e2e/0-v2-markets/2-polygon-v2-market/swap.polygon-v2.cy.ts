import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aMATICPolygonV2: 100,
};

const testData = {
  swap: [
    {
      fromAsset: assets.polygonMarket.MATIC,
      toAsset: assets.polygonMarket.USDC,
      isCollateralFromAsset: true,
      amount: 10,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.USDC.shortName,
        wrapped: assets.polygonMarket.USDC.wrapped,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.MATIC.shortName,
        amount: 90,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
};

describe('SWAP, POLYGON V2 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ tokens: tokenSet(tokensToRequest) });
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
