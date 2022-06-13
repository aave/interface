import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../../support/steps/configuration.steps';
import { borrow, supply, swap } from '../../../../support/steps/main.steps';
import assets from '../../../../fixtures/assets.json';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import constants from '../../../../fixtures/constans.json';

const testData = {
  deposit: {
    asset: assets.avalancheMarket.AVAX,
    amount: 1000,
    hasApproval: true,
  },
};

const keyFrom = 'USDT';
const valueFrom = assets.avalancheV3Market.USDT;

Object.entries(assets.avalancheV3Market).forEach(([keyTo, valueTo]) => {
  if (keyFrom != keyTo && keyTo != 'AVAX' && keyTo != 'ALL' && !keyTo.startsWith('a')) {
    const borrowAssetFrom = {
      asset: valueFrom,
      amount: 5,
      apyType: constants.borrowAPYType.default,
      hasApproval: true,
    };
    const supplyAssetFrom = {
      asset: valueFrom,
      amount: 5,
      hasApproval: false,
    };
    const swapCase = {
      fromAsset: valueFrom,
      toAsset: valueTo,
      isCollateralFromAsset: false,
      amount: 10,
      hasApproval: false,
    };
    const verification = [
      {
        type: constants.dashboardTypes.deposit,
        assetName: valueTo.shortName,
      },
    ];
    describe(`Swap from ${keyFrom} to ${keyTo}`, () => {
      const skipTestState = skipState(false);
      configEnvWithTenderlyAvalancheFork({ market: 'fork_proto_avalanche_v3', v3: true });
      supply(testData.deposit, skipTestState, false);
      borrow(borrowAssetFrom, skipTestState, false);
      supply(supplyAssetFrom, skipTestState, false);
      swap(swapCase, skipTestState, false);
      dashboardAssetValuesVerification(verification, skipTestState);
    });
  }
});
