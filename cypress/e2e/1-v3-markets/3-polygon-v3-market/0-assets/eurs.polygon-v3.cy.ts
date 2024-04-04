import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../../support/steps/configuration.steps';
import { borrow, repay, supply, withdraw } from '../../../../support/steps/main.steps';
import {
  dashboardAssetValuesVerification,
  switchCollateralBlocked,
} from '../../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aMATICPolygonV3: 9000,
};

const testData = {
  testCases: {
    borrow: [
      {
        asset: assets.polygonV3Market.EURS,
        amount: 50.1,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
    ],
    deposit: {
      asset: assets.polygonV3Market.EURS,
      amount: 10.1,
      hasApproval: false,
    },
    repay: [
      {
        asset: assets.polygonV3Market.EURS,
        apyType: constants.apyType.variable,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.polygonV3Market.EURS,
        apyType: constants.apyType.variable,
        repayableAsset: assets.polygonV3Market.aEURS,
        amount: 2,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
    withdraw: {
      asset: assets.polygonV3Market.EURS,
      isCollateral: false,
      amount: 1,
      hasApproval: true,
    },
    checkBorrowTypeBlocked: {
      asset: assets.polygonV3Market.EURS,
      isCollateralType: false,
    },
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonV3Market.EURS.shortName,
        amount: 7.0,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonV3Market.EURS.shortName,
        amount: 46.0,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

//due unstable
describe.skip('EURS INTEGRATION SPEC, POLYGON V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({
    market: 'fork_proto_polygon_v3',
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
  switchCollateralBlocked(testData.testCases.checkBorrowTypeBlocked, skipTestState);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
