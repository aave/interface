import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import assets from '../../../fixtures/assets.json';
import {
  doSwitchToDashboardBorrowView,
  doSwitchToDashboardSupplyView,
} from '../../../support/steps/actions.steps';

const HALF_WALLET = {
  address: `0x0681abf40a5cebda94fcaadccad9ae5e0cad1bc4`,
  privateKey: `57bc64f070aeb5ed6f69398ef933e55b74de7a7ec3ebe40f5f009a31a3eff151`,
};

const FULL_WALLET = {
  address: `0x008c8395eaba2553cde019af1be19a89630e031f`,
  privateKey: `57bc64f070aeb5ed6f69398ef933e55b74de7a7ec3ebe40f5f009a31a3eff151`,
};

const ERROR_MESSAGE = 'Allowance required action';

describe('ACCESSIBILITY, ARC V2 MARKET, INTEGRATION SPEC', () => {
  describe('Accessibility for account without access', () => {
    configEnvWithTenderlyMainnetFork({ market: 'fork_arc_v2' });
    it('Check that deposit modal return error message', () => {
      doSwitchToDashboardSupplyView();
      cy.get(`[data-cy='dashboardSupplyListItem_${assets.aaveMarket.ETH.shortName.toUpperCase()}']`)
        .find('button:contains("Supply")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("${ERROR_MESSAGE}")`).should('be.visible');
    });
  });
  describe('Accessibility for account with full access', () => {
    configEnvWithTenderlyMainnetFork({ market: 'fork_arc_v2', wallet: FULL_WALLET });
    it('Check that deposit available for full access ', () => {
      doSwitchToDashboardSupplyView();
      cy.get(`[data-cy='dashboardSupplyListItem_${assets.aaveMarket.ETH.shortName.toUpperCase()}']`)
        .find('button:contains("Supply")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Supply ${assets.aaveMarket.ETH.shortName}")`).should(
        'be.visible'
      );
      cy.get('[data-cy="close-button"]').click();
    });
    it('Check that borrow not available for full access', () => {
      doSwitchToDashboardBorrowView();
      cy.get(`[data-cy='dashboardBorrowListItem_${assets.aaveMarket.ETH.shortName.toUpperCase()}']`)
        .find('button:contains("Borrow")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Borrow ${assets.aaveMarket.ETH.shortName}")`).should(
        'be.visible'
      );
      cy.get('[data-cy="close-button"]').click();
    });
  });
  describe('Accessibility for account with full access', () => {
    configEnvWithTenderlyMainnetFork({ market: 'fork_arc_v2', wallet: HALF_WALLET });
    it('Check that deposit available for full access ', () => {
      doSwitchToDashboardSupplyView();
      cy.get(`[data-cy='dashboardSupplyListItem_${assets.aaveMarket.ETH.shortName.toUpperCase()}']`)
        .find('button:contains("Supply")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Supply ${assets.aaveMarket.ETH.shortName}")`).should(
        'be.visible'
      );
      cy.get('[data-cy="close-button"]').click();
    });
    it.skip('Check that borrow not available for full access', () => {
      doSwitchToDashboardBorrowView();
      cy.get(`[data-cy='dashboardBorrowListItem_${assets.aaveMarket.ETH.shortName.toUpperCase()}']`)
        .find('button:contains("Borrow")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("${ERROR_MESSAGE}")`).should('be.visible');
      cy.get('[data-cy="close-button"]').click();
    });
  });
});
