import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlySepoliaGhoFork } from '../../../support/steps/configuration.steps';
import { borrow, repay } from '../../../support/steps/main.steps';
import {
  checkDashboardHealthFactor,
  dashboardAssetValuesVerification,
} from '../../../support/steps/verification.steps';
import { tokenSet } from './helpers/token.helper';

const testData = {
  borrow: {
    asset: assets.ghoV3Market.GHO,
    amount: 25,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
  borrowMax: {
    asset: assets.ghoV3Market.GHO,
    amount: 25,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
    isMaxAmount: true,
    isRisk: true,
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

describe(`GHO base testing and e-mode`, () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlySepoliaGhoFork({ v3: true, tokens: tokenSet({ aDAI: 500 }) });

  borrow(testData.borrow, skipTestState, true);
  repay(testData.repay, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
  borrow(testData.borrowMax, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.1 }, skipTestState);
  // GHO not in e-mode list
  // emodeActivating({ turnOn: true, emodeOption: 'Stable-EMode' }, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.07, valueTo: 10000 }, skipTestState);
  borrow(testData.borrowMax, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.1 }, skipTestState);
});
