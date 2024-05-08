import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvScroll } from '../../../support/steps/configuration.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  dashboard: [
    {
      type: constants.dashboardTypes.deposit,
      assetName: assets.scrollV3Market.ETH.shortName,
      collateralType: constants.collateralType.isCollateral,
      isCollateral: true,
    },
  ],
};

describe('SCROLL GENERAL SPEC', () => {
  const skipTestState = skipState(false);
  configEnvScroll('0x280c15962f345349669c90e75694fe0262f4e9cb');
  dashboardAssetValuesVerification(testData.dashboard, skipTestState);
});
