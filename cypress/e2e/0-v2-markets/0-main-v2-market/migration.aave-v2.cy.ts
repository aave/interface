// TODO: Add back after incentives merged fix
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import { borrow, changeCollateral, doCloseModal, supply } from '../../../support/steps/main.steps';
import { dashboardAssetValuesVerification } from '../../../support/steps/verification.steps';

const testData = {
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
  migrationSupply: [assets.aaveMarket.WETH, assets.aaveMarket.DAI],
  migrationBorrow: [assets.aaveMarket.DAI, assets.aaveMarket.WETH],
  verifications: {
    finalDashboard: [
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
        isCollateral: false,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.DAI.shortName,
        wrapped: assets.aaveMarket.DAI.wrapped,
        amount: 50,
        apyType: constants.borrowAPYType.variable,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.DAI.shortName,
        wrapped: assets.aaveMarket.DAI.wrapped,
        amount: 50,
        apyType: constants.borrowAPYType.stable,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.aaveMarket.ETH.shortName,
        wrapped: assets.aaveMarket.ETH.wrapped,
        amount: 1,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};

describe('MIGRATION, ETHEREUM V2 MARKET, INTEGRATION SPEC', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({});
  describe(`Prepare v2 market`, () => {
    supply(testData.depositBase, skipTestState, true);
    testData.borrow.forEach(($borrow) => {
      borrow($borrow, skipTestState, true);
    });
    testData.supply.forEach(($supply) => {
      supply($supply, skipTestState, true);
    });
    changeCollateral(testData.collateral.switchOff, skipTestState, false);
  });
  describe(`Migration process`, () => {
    before(`Open migration page`, () => {
      cy.get(`[data-cy="migration-button"]`).click();
      cy.wait(10000); //no way to wait till loading all data
    });
    testData.migrationSupply.forEach(($asset) => {
      it(`Choose supply asset ${$asset.shortName}`, () => {
        cy.get(`[data-cy="migration-borrow-${$asset.shortName}"]`)
          .find(`[data-cy="migration-checkbox"]`)
          .click();
      });
    });
    testData.migrationBorrow.forEach(($asset) => {
      it(`Choose borrow asset ${$asset.shortName}`, () => {
        cy.get(`[data-cy="migration-supply-${$asset.shortName}"]`)
          .find(`[data-cy="migration-checkbox"]`)
          .click();
      });
    });
    it(`Agree and open migration`, () => {
      cy.get(`[data-cy="migration-risk-checkbox"]`).click();
      cy.get(`[data-cy="migration-button"]`).click();
    });
    it(`Migration modal`, () => {
      cy.wait(2000);
      cy.get('[data-cy=Modal]')
        .find('[data-cy=approveButtonChange]')
        .last()
        .click({ force: true })
        .get('[data-cy=approveOption_Transaction]')
        .first()
        .click({ force: true });
      cy.wait(2000);
      cy.doConfirm(false, `Migration`);
    });
    doCloseModal();
  });
  describe(`Open v3 market`, () => {
    it(`Move back to market page`, () => {
      cy.get(`[data-cy="goBack-btn"]`).click();
      cy.doSwitchMarket('mainnet', true);
    });
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
