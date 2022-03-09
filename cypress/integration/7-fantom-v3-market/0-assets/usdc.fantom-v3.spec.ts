import {
  configEnvWithTenderlyFantomTestnetFork,
  configEnvWithTenderlyMumbaiFork, configEnvWithTenderlyOptimismKovanFork
} from "../../../support/steps/configuration.steps";
import { supply, borrow, repay, withdraw } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';

const testData = {
  depositBaseAmount: {
    asset: assets.fantomMarket.FTM,
    amount: 9000,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.fantomMarket.USDC,
      amount: 25,
      hasApproval: true,
    },
    deposit: {
      asset: assets.fantomMarket.USDC,
      amount: 10,
      hasApproval: false,
    },
    repay:[
      {
        asset: assets.fantomMarket.USDC,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.fantomMarket.aUSDC,
        apyType: constants.apyType.variable,
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
        wrapped: assets.fantomMarket.USDC.wrapped,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.fantomMarket.USDC.shortName,
        wrapped: assets.fantomMarket.USDC.wrapped,
        amount: 21.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('USDC INTEGRATION SPEC, FANTOM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyFantomTestnetFork({});

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
