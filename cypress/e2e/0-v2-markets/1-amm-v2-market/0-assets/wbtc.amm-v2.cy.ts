import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constants.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchApyBlocked,
} from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.ammMarket.ETH,
    amount: 100,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.ammMarket.WBTC,
      amount: 0.5,
      hasApproval: true,
    },
    deposit: {
      asset: assets.ammMarket.WBTC,
      amount: 0.2,
      hasApproval: false,
    },
    repay: {
      asset: assets.ammMarket.WBTC,
      apyType: constants.apyType.variable,
      amount: 0.1,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: {
      asset: assets.ammMarket.WBTC,
      isCollateral: true,
      amount: 0.1,
      hasApproval: true,
    },
    checkDisabledApy: {
      asset: assets.ammMarket.WBTC,
      apyType: constants.apyType.variable,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.ammMarket.WBTC.shortName,
        wrapped: assets.ammMarket.WBTC.wrapped,
        amount: 0.1,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.ammMarket.WBTC.shortName,
        wrapped: assets.ammMarket.WBTC.wrapped,
        amount: 0.4,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('WETH INTEGRATION SPEC, AMM V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({
    market: 'fork_amm_mainnet',
  });

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  repay(testData.testCases.repay, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  switchApyBlocked(testData.testCases.checkDisabledApy, skipTestState);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
