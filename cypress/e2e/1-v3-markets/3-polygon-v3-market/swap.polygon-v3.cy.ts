import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aMATICPolygonV3: 900,
};

const testData = {
  swap: [
    {
      fromAsset: assets.polygonV3Market.MATIC,
      toAsset: assets.polygonV3Market.USDC,
      isCollateralFromAsset: true,
      amount: 20,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonV3Market.USDC.shortName,
        wrapped: assets.polygonV3Market.USDC.wrapped,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonV3Market.MATIC.shortName,
        amount: 880,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
};
//due frozen assets
describe.skip('SWAP, POLYGON V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({
    market: 'fork_proto_polygon_v3',
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
