import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAEthereumV3Fork } from '../../../support/steps/configuration.steps';
import { supply, swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  deposit: {
    asset: assets.ethereumV3Market.ETH,
    amount: 1,
    hasApproval: true,
  },
  swap: [
    {
      fromAsset: assets.ethereumV3Market.ETH,
      toAsset: assets.ethereumV3Market.USDC,
      isCollateralFromAsset: true,
      amount: 0.1,
      hasApproval: false,
    },
  ],
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.ethereumV3Market.USDC.shortName,
        wrapped: assets.ethereumV3Market.USDC.wrapped,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.ethereumV3Market.ETH.shortName,
        amount: 0.9,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
    ],
  },
};

describe('SWAP, ETHEREUM V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAEthereumV3Fork({ v3: true });

  supply(testData.deposit, skipTestState, true);
  testData.swap.forEach((swapCase) => {
    swap(swapCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
