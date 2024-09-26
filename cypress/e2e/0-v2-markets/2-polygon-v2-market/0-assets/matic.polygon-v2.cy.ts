import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeCollateral,
  changeCollateralNegative,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
} from '../../../../support/steps/verification.steps';
import { RequestedTokens, tokenSet } from '../../../4-gho-ethereum/helpers/token.helper';

const tokensToRequest: RequestedTokens = {
  aMATICPolygonV2: 800,
};

const testData = {
  testCases: {
    deposit: {
      asset: assets.polygonMarket.POL,
      amount: 1.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.polygonMarket.POL,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.polygonMarket.POL,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.polygonMarket.POL,
        isCollateralType: true,
      },
    },
    borrow: {
      asset: assets.polygonMarket.POL,
      amount: 0.04,
      apyType: constants.borrowAPYType.default,
      hasApproval: false,
    },
    repay: {
      asset: assets.polygonMarket.POL,
      apyType: constants.apyType.variable,
      amount: 0.01,
      hasApproval: true,
      repayOption: constants.repayType.default,
    },
    withdraw: [
      {
        asset: assets.polygonMarket.POL,
        isCollateral: true,
        amount: 0.01,
        hasApproval: false,
      },
      {
        asset: assets.polygonMarket.POL,
        isCollateral: true,
        amount: 0.01,
        hasApproval: true,
        forWrapped: true,
      },
    ],
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.POL.shortName,
        wrapped: assets.polygonMarket.POL.wrapped,
        amount: 1.07,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonMarket.POL.shortName,
        wrapped: assets.polygonMarket.POL.wrapped,
        amount: 0.03,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('POL INTEGRATION SPEC, POLYGON V2 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ tokens: tokenSet(tokensToRequest) });

  supply(testData.testCases.deposit, skipTestState, true);
  describe('Check Collateral switching', () => {
    changeCollateral(testData.testCases.collateral.switchOff, skipTestState, false);
    borrowsUnavailable(skipTestState);
    changeCollateral(testData.testCases.collateral.switchOn, skipTestState, false);
  });
  borrow(testData.testCases.borrow, skipTestState, true);
  changeCollateralNegative(testData.testCases.collateral.switchNegative, skipTestState, false);
  repay(testData.testCases.repay, skipTestState, false);
  testData.testCases.withdraw.forEach((withdrawCase) => {
    withdraw(withdrawCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
