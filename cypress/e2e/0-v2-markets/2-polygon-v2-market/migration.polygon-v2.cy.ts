import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../support/steps/configuration.steps';
import { borrow, changeCollateral, migration, supply } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  v2Market: {
    depositBase: {
      asset: assets.polygonMarket.MATIC,
      amount: 500,
      hasApproval: true,
    },
    borrow: [
      {
        asset: assets.polygonMarket.DAI,
        amount: 50,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
      {
        asset: assets.polygonMarket.MATIC,
        amount: 100,
        apyType: constants.borrowAPYType.default,
        hasApproval: false,
      },
    ],
    supply: [
      {
        asset: assets.polygonMarket.DAI,
        amount: 50,
        hasApproval: false,
      },
    ],
    collateral: {
      switchOff: {
        asset: assets.polygonMarket.DAI,
        isCollateralType: true,
        hasApproval: true,
      },
    },
  },
  migration: {
    supplies: [
      { shortName: assets.polygonMarket.MATIC.shortName },
      { shortName: assets.polygonMarket.DAI.shortName },
    ],
    borrows: [
      { shortName: assets.polygonMarket.MATIC.shortName },
      { shortName: assets.polygonMarket.DAI.shortName },
    ],
    isAllSupplies: true,
    isAllBorrows: true,
  },
  verifications: {
    finalDashboard1: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.MATIC.shortName,
        wrapped: assets.polygonMarket.MATIC.wrapped,
        amount: 500,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonMarket.DAI.shortName,
        wrapped: assets.polygonMarket.DAI.wrapped,
        amount: 50,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonMarket.DAI.shortName,
        wrapped: assets.polygonMarket.DAI.wrapped,
        amount: 50,
        apyType: constants.borrowAPYType.variable,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonMarket.MATIC.shortName,
        wrapped: assets.polygonMarket.MATIC.wrapped,
        amount: 100,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe.skip('MIGRATION, POLYGON V2 MARKET, MIGRATE TO EMPTY MARKET SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({});
  describe(`Prepare v2 market`, () => {
    supply(testData.v2Market.depositBase, skipTestState, true);
    testData.v2Market.borrow.forEach(($borrow) => {
      borrow($borrow, skipTestState, true);
    });
    testData.v2Market.supply.forEach(($supply) => {
      supply($supply, skipTestState, true);
    });
    changeCollateral(testData.v2Market.collateral.switchOff, skipTestState, false);
  });
  migration(testData.migration, skipTestState, true);
  describe(`Open v3 market`, () => {
    it(`Move back to market page`, () => {
      cy.doSwitchMarket('polygon', true);
    });
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard1, skipTestState);
});
