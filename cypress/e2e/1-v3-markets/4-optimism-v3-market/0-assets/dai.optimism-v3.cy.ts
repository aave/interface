import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyOptimismFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeBorrowType,
  repay,
  supply,
  withdraw,
  withdrawAndSwitch,
} from '../../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aETHOptimismV3: 9000,
};

const testData = {
  testCases: {
    borrow: [
      {
        asset: assets.optimismMarket.DAI,
        amount: 25,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.optimismMarket.DAI,
        amount: 25,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    changeBorrowType: [
      {
        asset: assets.optimismMarket.DAI,
        apyType: constants.borrowAPYType.stable,
        newAPY: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.optimismMarket.DAI,
        apyType: constants.borrowAPYType.variable,
        newAPY: constants.borrowAPYType.stable,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.optimismMarket.DAI,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.optimismMarket.DAI,
        apyType: constants.apyType.stable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.optimismMarket.DAI,
        apyType: constants.apyType.stable,
        repayableAsset: assets.optimismMarket.aDAI,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.optimismMarket.DAI,
      isCollateral: true,
      amount: 1,
      hasApproval: true,
    },
    withdrawAndSwitch: {
      fromAsset: assets.optimismMarket.DAI,
      toAsset: assets.optimismMarket.USDC,
      isCollateralFromAsset: true,
      amount: 5,
      hasApproval: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonV3Market.DAI.shortName,
        amount: 2.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonV3Market.DAI.shortName,
        amount: 46.0,
        apyType: constants.borrowAPYType.stable,
      },
    ],
  },
};

//due asset frozen
describe.skip('DAI INTEGRATION SPEC, OPTIMISM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyOptimismFork({
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
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
  withdrawAndSwitch(testData.testCases.withdrawAndSwitch, skipTestState, false);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
