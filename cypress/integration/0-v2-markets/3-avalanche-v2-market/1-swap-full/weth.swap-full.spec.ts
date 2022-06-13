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

const keyFrom = 'WETH';
const valueFrom = assets.avalancheMarket.WETH;

Object.entries(assets.avalancheMarket).forEach(([keyTo, valueTo]) => {
  if (keyFrom != keyTo && keyTo != 'AVAX' && keyTo != 'ALL') {
    const borrowAssetFrom = {
      asset: valueFrom,
      amount: 0.1,
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
      isCollateralFromAsset: true,
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
      configEnvWithTenderlyAvalancheFork({});
      supply(testData.deposit, skipTestState, false);
      borrow(borrowAssetFrom, skipTestState, false);
      supply(supplyAssetFrom, skipTestState, false);
      swap(swapCase, skipTestState, false);
      dashboardAssetValuesVerification(verification, skipTestState);
    });
  }
});
