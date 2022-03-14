import { configEnvWithTenderlyFantomTestnetFork } from '../../../../support/steps/configuration.steps';
import {
  supply,
  borrow,
  repay,
  withdraw,
  changeBorrowType,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import { skipState } from '../../../../support/steps/common';
import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';

const testData = {
  depositBaseAmount: {
    asset: assets.fantomMarket.FTM,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.fantomMarket.WBTC,
        amount: 0.25,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.fantomMarket.WBTC,
        amount: 0.25,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.fantomMarket.WBTC,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.fantomMarket.WBTC,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.fantomMarket.WBTC,
      amount: 0.101,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.fantomMarket.WBTC,
        apyType: constants.apyType.stable,
        amount: 0.02,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.fantomMarket.WBTC,
        apyType: constants.apyType.stable,
        repayableAsset: assets.fantomMarket.aWBTC,
        amount: 0.02,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.fantomMarket.WBTC,
      isCollateral: true,
      amount: 0.01,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.fantomMarket.WBTC.shortName,
        wrapped: assets.fantomMarket.WBTC.wrapped,
        amount: 0.07,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.fantomMarket.WBTC.shortName,
        wrapped: assets.fantomMarket.WBTC.wrapped,
        amount: 0.46,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe('WBTC INTEGRATION SPEC, FANTOM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomTestnetFork({});

  supply(testData.depositBaseAmount, skipTestState, true);
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  testData.testCases.changeBorrowType.forEach((changeAPRCase) => {
    changeBorrowType(changeAPRCase, skipTestState, true);
  });
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
