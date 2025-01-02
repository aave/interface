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

describe.skip('SCROLL GENERAL SPEC', () => {
  const skipTestState = skipState(false);
  configEnvScroll('0xF93457533efd041D2A5200A82ccA718Fcdc42103');
  dashboardAssetValuesVerification(testData.dashboard, skipTestState);
});
