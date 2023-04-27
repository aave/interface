import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';
import { borrow, migration, supply } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  v2Market: {
    depositBase: {
      asset: assets.avalancheMarket.AVAX,
      amount: 500,
      hasApproval: true,
    },
    borrow: [
      //due DAI frozen
      // {
      //   asset: assets.avalancheMarket.DAI,
      //   amount: 50,
      //   apyType: constants.borrowAPYType.default,
      //   hasApproval: true,
      // },
      {
        asset: assets.avalancheMarket.AVAX,
        amount: 100,
        apyType: constants.borrowAPYType.default,
        hasApproval: false,
      },
    ],
    supply: [
      {
        asset: assets.avalancheMarket.DAI,
        amount: 50,
        hasApproval: false,
      },
    ],
    collateral: {
      switchOff: {
        asset: assets.avalancheMarket.DAI,
        isCollateralType: true,
        hasApproval: true,
      },
    },
  },
  migration: {
    supplies: [
      { shortName: assets.avalancheMarket.AVAX.shortName },
      { shortName: assets.avalancheMarket.DAI.shortName },
    ],
    borrows: [
      { shortName: assets.avalancheMarket.AVAX.shortName },
      { shortName: assets.avalancheMarket.DAI.shortName },
    ],
    isAllSupplies: true,
    isAllBorrows: true,
  },
  verifications: {
    finalDashboard1: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.avalancheMarket.AVAX.shortName,
        wrapped: assets.avalancheMarket.AVAX.wrapped,
        amount: 500,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      //due DAI frozen
      // {
      //   type: constants.dashboardTypes.deposit,
      //   assetName: assets.avalancheMarket.DAI.shortName,
      //   wrapped: assets.avalancheMarket.DAI.wrapped,
      //   amount: 50,
      //   collateralType: constants.collateralType.isCollateral,
      //   isCollateral: true,
      // },
      // {
      //   type: constants.dashboardTypes.borrow,
      //   assetName: assets.avalancheMarket.DAI.shortName,
      //   wrapped: assets.avalancheMarket.DAI.wrapped,
      //   amount: 50,
      //   apyType: constants.borrowAPYType.variable,
      // },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.avalancheMarket.AVAX.shortName,
        wrapped: assets.avalancheMarket.AVAX.wrapped,
        amount: 100,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};
//skip due v3 market borrow avax full
describe.skip('MIGRATION, AVALANCHE V2 MARKET, MIGRATE TO EMPTY MARKET SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAvalancheFork({});
  describe(`Prepare v2 market`, () => {
    supply(testData.v2Market.depositBase, skipTestState, true);
    testData.v2Market.borrow.forEach(($borrow) => {
      borrow($borrow, skipTestState, true);
    });
    //due DAI frozen
    // testData.v2Market.supply.forEach(($supply) => {
    //   supply($supply, skipTestState, true);
    // });
    // changeCollateral(testData.v2Market.collateral.switchOff, skipTestState, false);
  });
  migration(testData.migration, skipTestState, true);
  describe(`Open v3 market`, () => {
    it(`Move back to market page`, () => {
      cy.doSwitchMarket('avalanche', true);
    });
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard1, skipTestState);
});
