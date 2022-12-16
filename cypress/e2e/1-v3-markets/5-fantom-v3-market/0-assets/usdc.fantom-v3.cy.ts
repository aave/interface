import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyFantomFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeBorrowType,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';

const testData = {
  depositBaseAmount: {
    asset: assets.fantomMarket.FTM,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: [
      {
        asset: assets.fantomMarket.USDC,
        amount: 25,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.fantomMarket.USDC,
        amount: 25,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.fantomMarket.USDC,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.fantomMarket.USDC,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.fantomMarket.USDC,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.fantomMarket.USDC,
        apyType: constants.apyType.stable,
        amount: 2,
        hasApproval: false,
        repayOption: constants.repayType.collateral,
      },
      {
        asset: assets.fantomMarket.USDC,
        apyType: constants.apyType.stable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.wallet,
      },
      {
        asset: assets.fantomMarket.USDC,
        apyType: constants.apyType.stable,
        repayableAsset: assets.fantomMarket.aUSDC,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.fantomMarket.USDC,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.fantomMarket.USDC.shortName,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.fantomMarket.USDC.shortName,
        amount: 44.0,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

describe('USDC INTEGRATION SPEC, FANTOM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomFork({ v3: true });

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
