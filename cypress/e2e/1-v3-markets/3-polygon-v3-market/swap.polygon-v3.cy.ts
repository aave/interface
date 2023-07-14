import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { supply, swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  deposit: {
    asset: assets.polygonV3Market.MATIC,
    amount: 900,
    hasApproval: true,
  },
  swap: [
    {
      fromAsset: assets.polygonV3Market.MATIC,
      toAsset: assets.polygonV3Market.DAI,
      isCollateralFromAsset: true,
      amount: 20,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonV3Market.DAI.shortName,
        wrapped: assets.polygonV3Market.DAI.wrapped,
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

describe('SWAP, POLYGON V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ market: 'fork_proto_polygon_v3', v3: true });

  supply(testData.deposit, skipTestState, true);
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
