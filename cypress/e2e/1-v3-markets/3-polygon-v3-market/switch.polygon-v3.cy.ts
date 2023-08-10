import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  deposit: {
    asset: assets.polygonV3Market.MATIC,
    amount: 900,
    hasApproval: true,
  },
  borrow: {
    asset: assets.polygonV3Market.DAI,
    amount: 50,
    apyType: constants.borrowAPYType.stable,
    hasApproval: true,
  },
  swap: {
    fromAsset: assets.polygonV3Market.DAI,
    toAsset: assets.polygonV3Market.WBTC,
    isBorrowed: true,
    isVariableBorrowedAPY: false,
    amount: 200,
    hasApproval: false,
    isMaxAmount: true,
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonV3Market.WBTC.shortName,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('SWITCH BORROWED, POLYGON V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ market: 'fork_proto_polygon_v3', v3: true });

  supply(testData.deposit, skipTestState, true);
  borrow(testData.borrow, skipTestState, true);
  swap(testData.swap, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
