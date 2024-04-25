import { configEnvHarmony } from '../../../support/steps/configuration.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';
import constants from '../../../fixtures/constans.json';
import assets from '../../../fixtures/assets.json';
import { skipState } from '../../../support/steps/common';

const testData = {
  dashboard: [
    {
      type: constants.dashboardTypes.deposit,
      assetName: assets.harmonyMarket.ONE.shortName,
      collateralType: constants.collateralType.isCollateral,
      isCollateral: true,
    },
    {
      type: constants.dashboardTypes.deposit,
      assetName: assets.harmonyMarket.USDC.shortName,
      collateralType: constants.collateralType.isCollateral,
      isCollateral: true,
    },
    {
      type: constants.dashboardTypes.deposit,
      assetName: assets.harmonyMarket.DAI.shortName,
      collateralType: constants.collateralType.isCollateral,
      isCollateral: true,
    },
    {
      type: constants.dashboardTypes.borrow,
      assetName: assets.harmonyMarket.DAI.shortName,
      apyType: constants.borrowAPYType.variable,
    },
  ],
};

describe('HARMONY GENERAL SPEC', () => {
  const skipTestState = skipState(false);
  configEnvHarmony('0xE4217040c894e8873EE19d675b6d0EeC992c2c0D');
  dashboardAssetValuesVerification(testData.dashboard, skipTestState);
});
