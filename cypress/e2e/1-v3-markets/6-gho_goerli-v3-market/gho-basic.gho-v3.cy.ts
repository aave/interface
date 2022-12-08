import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyGoerliGhoFork } from '../../../support/steps/configuration.steps';
import { borrow, repay, supply } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.ghoV3Market.ETH,
    amount: 10,
    hasApproval: true,
  },
  borrow: {
    asset: assets.ghoV3Market.GHO,
    amount: 25,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
  repay: {
    asset: assets.ghoV3Market.GHO,
    apyType: constants.apyType.variable,
    amount: 5,
    hasApproval: false,
    repayOption: constants.repayType.default,
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.ghoV3Market.GHO.shortName,
        amount: 20,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe(`GHO base testing`, () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyGoerliGhoFork({ v3: true });

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.borrow, skipTestState, true);
  repay(testData.repay, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
