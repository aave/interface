import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import assets from '../../../fixtures/assets.json';
import {
  doSwitchToDashboardBorrowView,
  doSwitchToDashboardSupplyView,
} from '../../../support/steps/actions.steps';

//for execute need to add wallet values
const HALF_WALLET = {
  address: ``,
  privateKey: ``,
};

//for execute need to add wallet values
const FULL_WALLET = {
  address: ``,
  privateKey: ``,
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
