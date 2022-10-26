import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeBorrowType,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';

const testData = {
  depositETH: {
    asset: assets.aaveMarket.ETH,
    amount: 0.5,
    hasApproval: true,
  },
  testCases: {
    deposit: {
      asset: assets.aaveMarket.REN,
      amount: 100,
      hasApproval: false,
    },
    borrow: [
      {
        asset: assets.aaveMarket.REN,
        amount: 100,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.REN,
        amount: 100,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.aaveMarket.REN,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.REN,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    repay: [
      {
        asset: assets.aaveMarket.REN,
        apyType: constants.apyType.stable,
        amount: 20,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      // {
      //   asset: assets.aaveMarket.REN,
      //   apyType: constants.apyType.stable,
      //   amount: 20,
      //   hasApproval: false,
      //   repayOption: constants.repayType.collateral,
      //   assetForRepay: assets.aaveMarket.BAT,
      // },
    ],
    withdraw: {
      asset: assets.aaveMarket.REN,
      isCollateral: true,
      amount: 20,
      hasApproval: true,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.REN.shortName,
        wrapped: assets.aaveMarket.REN.wrapped,
        // amount: 60,
        amount: 80,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.REN.shortName,
        wrapped: assets.aaveMarket.REN.wrapped,
        // amount: 160,
        amount: 180,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};
//skipped because it was disabled on ETH V2 Market
describe.skip('REN INTEGRATION SPEC, AAVE V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});
  supply(testData.depositETH, skipTestState, true);
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
