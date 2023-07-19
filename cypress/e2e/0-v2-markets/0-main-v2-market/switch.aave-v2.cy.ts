import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  deposit: {
    asset: assets.aaveMarket.ETH,
    amount: 1,
    hasApproval: true,
  },
  borrow: {
    asset: assets.aaveMarket.DAI,
    amount: 50,
    apyType: constants.borrowAPYType.stable,
    hasApproval: true,
  },
  swap: {
    fromAsset: assets.aaveMarket.DAI,
    toAsset: assets.aaveMarket.LUSD,
    isBorrowed: true,
    isVariableBorrowedAPY: false,
    amount: 200,
    changeApprove: true,
    hasApproval: false,
    isMaxAmount: true,
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.LUSD.shortName,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('SWITCH BORROWED, AAVE V2 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});

  supply(testData.deposit, skipTestState, true);
  borrow(testData.borrow, skipTestState, true);
  swap(testData.swap, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
