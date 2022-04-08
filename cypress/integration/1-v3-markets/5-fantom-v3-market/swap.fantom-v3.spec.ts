import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyFantomFork } from '../../../support/steps/configuration.steps';
import { supply, swap } from '../../../support/steps/main.steps';
import assets from '../../../fixtures/assets.json';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';
import constants from '../../../fixtures/constans.json';

const testData = {
  deposit: {
    asset: assets.fantomMarket.FTM,
    amount: 100,
    hasApproval: true,
  },
  swap: [
    {
      fromAsset: assets.fantomMarket.FTM,
      toAsset: assets.fantomMarket.USDC,
      isCollateralFromAsset: true,
      amount: 10,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.fantomMarket.USDC.shortName,
        wrapped: assets.fantomMarket.USDC.wrapped,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.fantomMarket.FTM.shortName,
        amount: 90,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
};

describe('SWAP, FANTOM V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomFork({ v3: true });

  supply(testData.deposit, skipTestState, true);
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
