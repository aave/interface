import {
  configEnvWithTenderlyMumbaiFork,
  configEnvWithTenderlyPolygonFork
} from "../../../support/steps/configuration.steps";
import { supply, borrow, repay, withdraw } from '../../../support/steps/main.steps';
import {
  changeBorrowTypeBlocked,
  dashboardAssetValuesVerification,
} from "../../../support/steps/verification.steps";
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';

const testData = {
  depositBaseAmount: {
    asset: assets.polygonMarket.MATIC,
    amount: 800,
    hasApproval: true,
  },
  testCases: {
    borrow: {
      asset: assets.polygonMarket.EURS,
      amount: 25,
      hasApproval: true,
    },
    deposit: {
      asset: assets.polygonMarket.EURS,
      amount: 10,
      hasApproval: false,
    },
    repay:[
      {
        asset: assets.polygonMarket.EURS,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.polygonMarket.aEURS,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.polygonMarket.EURS,
      isCollateral: false,
      amount: 1,
      hasApproval: true,
    },
    checkDisabledCollateral: {
      asset: assets.polygonMarket.EURS,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.EURS.shortName,
        wrapped: assets.polygonMarket.EURS.wrapped,
        amount: 7.0,
        collateralType: constants.collateralType.isNotCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonMarket.EURS.shortName,
        wrapped: assets.polygonMarket.EURS.wrapped,
        amount: 21.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('EURS INTEGRATION SPEC, POLYGON V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMumbaiFork({market:"fork_proto_mumbai_v3"});

  supply(testData.depositBaseAmount, skipTestState, true);
  borrow(testData.testCases.borrow, skipTestState, true);
  supply(testData.testCases.deposit, skipTestState, true);
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  withdraw(testData.testCases.withdraw, skipTestState, false);
  changeBorrowTypeBlocked(testData.testCases.checkDisabledCollateral, skipTestState);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
