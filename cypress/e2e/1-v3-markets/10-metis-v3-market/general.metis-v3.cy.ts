import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvMetis } from '../../../support/steps/configuration.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  dashboard: [
    {
      type: constants.dashboardTypes.deposit,
      assetName: assets.metisV3Market.METIS.shortName,
      collateralType: constants.collateralType.isCollateral,
      isCollateral: false,
    },
  ],
};

describe('METIS GENERAL SPEC', () => {
  const skipTestState = skipState(false);
  configEnvMetis('0x535a34D33984e797ae2FcCbd395FCD18764E669c');
  dashboardAssetValuesVerification(testData.dashboard, skipTestState);
});
