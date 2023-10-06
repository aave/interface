import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyBaseFork } from '../../../support/steps/configuration.steps';
import { supply, swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  deposit: {
    asset: assets.baseV3Market.ETH,
    amount: 4,
    hasApproval: true,
  },
  swap: [
    {
      fromAsset: assets.baseV3Market.ETH,
      toAsset: assets.baseV3Market.USDbC,
      isCollateralFromAsset: true,
      amount: 2,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.baseV3Market.USDbC.shortName,
        wrapped: assets.baseV3Market.USDbC.wrapped,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.baseV3Market.ETH.shortName,
        amount: 2,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
};

describe('SWAP, BASE V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyBaseFork({ v3: true });

  supply(testData.deposit, skipTestState, true);
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
