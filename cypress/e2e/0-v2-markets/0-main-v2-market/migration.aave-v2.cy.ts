import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import {
  configEnvWithTenderlyAEthereumV3Fork,
  configEnvWithTenderlyMainnetFork,
} from '../../../support/steps/configuration.steps';
import { borrow, changeCollateral, migration, supply } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
  v2Market: {
    depositBase: {
      asset: assets.aaveMarket.ETH,
      amount: 10,
      hasApproval: true,
    },
    borrow: [
      {
        asset: assets.aaveMarket.DAI,
        amount: 50,
        apyType: constants.borrowAPYType.variable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.DAI,
        amount: 50,
        apyType: constants.borrowAPYType.stable,
        hasApproval: true,
      },
      {
        asset: assets.aaveMarket.ETH,
        amount: 1,
        apyType: constants.borrowAPYType.variable,
        hasApproval: false,
      },
    ],
    supply: [
      {
        asset: assets.aaveMarket.DAI,
        amount: 50,
        hasApproval: false,
      },
    ],
    collateral: {
      switchOff: {
        asset: assets.aaveMarket.DAI,
        isCollateralType: true,
        hasApproval: true,
      },
    },
  },
  v3Market: {
    depositBase: {
      asset: assets.ethereumV3Market.ETH,
      amount: 10,
      hasApproval: true,
    },
    borrow: [
      {
        asset: assets.ethereumV3Market.DAI,
        amount: 50,
        apyType: constants.borrowAPYType.default,
        hasApproval: true,
      },
      {
        asset: assets.ethereumV3Market.ETH,
        amount: 1,
        apyType: constants.borrowAPYType.default,
        hasApproval: false,
      },
    ],
    supply: [
      {
        asset: assets.ethereumV3Market.DAI,
        amount: 50,
        hasApproval: false,
      },
    ],
    collateral: {
      switchOff: {
        asset: assets.aaveMarket.DAI,
        isCollateralType: true,
        hasApproval: true,
      },
    },
  },
  migration: {
    supplies: [
      { shortName: assets.aaveMarket.WETH.shortName },
      { shortName: assets.aaveMarket.DAI.shortName },
    ],
    borrows: [
      { shortName: assets.aaveMarket.WETH.shortName },
      { shortName: assets.aaveMarket.DAI.shortName },
    ],
    isAllSupplies: true,
    isAllBorrows: true,
  },
  verifications: {
    finalDashboard1: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.ETH.shortName,
        wrapped: assets.aaveMarket.ETH.wrapped,
        amount: 10,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.DAI.shortName,
        wrapped: assets.aaveMarket.DAI.wrapped,
        amount: 50,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.DAI.shortName,
        wrapped: assets.aaveMarket.DAI.wrapped,
        amount: 100,
        apyType: constants.borrowAPYType.variable,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.ETH.shortName,
        wrapped: assets.aaveMarket.ETH.wrapped,
        amount: 1,
        apyType: constants.borrowAPYType.variable,
      },
    ],
    finalDashboard2: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.ETH.shortName,
        wrapped: assets.aaveMarket.ETH.wrapped,
        amount: 20,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.aaveMarket.DAI.shortName,
        wrapped: assets.aaveMarket.DAI.wrapped,
        amount: 100,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.DAI.shortName,
        wrapped: assets.aaveMarket.DAI.wrapped,
        amount: 150,
        apyType: constants.borrowAPYType.variable,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.ETH.shortName,
        wrapped: assets.aaveMarket.ETH.wrapped,
        amount: 2,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('MIGRATION, ETHEREUM V2 MARKET, MIGRATE TO EMPTY MARKET SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});
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
      cy.doSwitchMarket('mainnet', true);
    });
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard1, skipTestState);
});

describe('MIGRATION, ETHEREUM V2 MARKET, MIGRATE TO NOT EMPTY MARKET SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyAEthereumV3Fork({ v3: true });
  describe(`Prepare v3 market`, () => {
    supply(testData.v3Market.depositBase, skipTestState, true);
    testData.v3Market.borrow.forEach(($borrow) => {
      borrow($borrow, skipTestState, true);
    });
    testData.v3Market.supply.forEach(($supply) => {
      supply($supply, skipTestState, true);
    });
  });
  describe(`Open v2 market`, () => {
    it(`Move back to market page`, () => {
      cy.doSwitchMarket('mainnet', false);
    });
  });
  describe(`Prepare v2 market`, () => {
    supply(testData.v3Market.depositBase, skipTestState, true);
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
      cy.doSwitchMarket('mainnet', true);
    });
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard2, skipTestState);
});
