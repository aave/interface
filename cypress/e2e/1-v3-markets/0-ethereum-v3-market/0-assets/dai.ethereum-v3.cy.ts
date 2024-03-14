import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyAEthereumV3Fork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  repay,
  supply,
  withdraw,
  withdrawAndSwitch,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aETHEthereumV3: 900,
};

const testData = {
  testCases: {
    borrow: [
      {
        asset: assets.ethereumV3Market.DAI,
        amount: 50,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.ethereumV3Market.DAI,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.ethereumV3Market.DAI,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: false,
        repayOption: constants.repayType.collateral,
      },
      {
        asset: assets.ethereumV3Market.DAI,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.wallet,
      },
      {
        asset: assets.ethereumV3Market.DAI,
        apyType: constants.apyType.variable,
        repayableAsset: assets.ethereumV3Market.aDAI,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.ethereumV3Market.DAI,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
    withdrawAndSwitch: {
      fromAsset: assets.ethereumV3Market.DAI,
      toAsset: assets.ethereumV3Market.USDT,
      isCollateralFromAsset: true,
      amount: 5,
      hasApproval: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.ethereumV3Market.DAI.shortName,
        amount: 2.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.ethereumV3Market.DAI.shortName,
        amount: 44.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('DAI INTEGRATION SPEC, ETHEREUM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAEthereumV3Fork({
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdrawAndSwitch(testData.testCases.withdrawAndSwitch, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
