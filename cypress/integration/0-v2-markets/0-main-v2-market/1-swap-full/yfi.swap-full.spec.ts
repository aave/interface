import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../../support/steps/configuration.steps';
import { borrow, supply, swap } from '../../../../support/steps/main.steps';
import assets from '../../../../fixtures/assets.json';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import constants from '../../../../fixtures/constans.json';

const testData = {
  deposit: {
    asset: assets.aaveMarket.ETH,
    amount: 1000,
    hasApproval: true,
  },
};

const keyFrom = 'YFI';
const valueFrom = assets.aaveMarket.YFI;

Object.entries(assets.aaveMarket).forEach(([keyTo, valueTo]) => {
  if (keyFrom != keyTo && keyTo != 'stkAAVE' && keyTo != 'ALL' && keyTo != 'ETH') {
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
      configEnvWithTenderlyMainnetFork({});
      supply(testData.deposit, skipTestState, false);
      borrow(borrowAssetFrom, skipTestState, false);
      supply(supplyAssetFrom, skipTestState, false);
      swap(swapCase, skipTestState, false);
      dashboardAssetValuesVerification(verification, skipTestState);
    });
  }
});
