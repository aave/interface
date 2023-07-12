import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import {
  configEnvWithTenderlyAvalancheFork,
  configEnvWithTenderlyPolygonFork,
} from '../../../support/steps/configuration.steps';
import { borrow, supply, swap } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  deposit: {
    asset: assets.avalancheV3Market.AVAX,
    amount: 100,
    hasApproval: true,
  },
  borrow: {
    asset: assets.avalancheV3Market.DAI,
    amount: 50,
    apyType: constants.borrowAPYType.stable,
    hasApproval: true,
  },
  swap: {
    fromAsset: assets.avalancheV3Market.DAI,
    toAsset: assets.avalancheV3Market.USDC,
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
        assetName: assets.avalancheV3Market.USDC.shortName,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('SWITCH BORROWED, AVALANCHE V3 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({ market: 'fork_proto_avalanche_v3', v3: true });

  supply(testData.deposit, skipTestState, true);
  borrow(testData.borrow, skipTestState, true);
  swap(testData.swap, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
