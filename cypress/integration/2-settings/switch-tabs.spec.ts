import { iteratee } from 'lodash';
import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

export const verifyElementsOnMarketsPage = (totalBorrows: string, totalMarketSize: string) => {
  cy.get('a[href*="/markets/"]').click();
  cy.contains(totalBorrows);
  cy.contains(totalMarketSize);
};
export const switchToTestNet = () => {
  cy.get('#settings-button').click();
  cy.contains('Testnet mode').click();
};
export const checkLinkOfButtons = (name: string, link: string) => {
  cy.contains(name).should('have.attr', 'href', `${link}`);
};

describe('Switch tabs in header', () => {
  configEnvWithTenderlyMainnetFork({});
  it('step1: Switch to the Testnet mode', () => {
    switchToTestNet();
  });

  it('step2:Switch tabs from Dashboard to Markets page', () => {
    verifyElementsOnMarketsPage('Total borrows', 'Total market size');
  });

  it('step3: Switch from Markets to Faucet ', () => {
    cy.get('a[href*="/faucet/"]').click();
    cy.contains('Test Assets');
  });

  it('step4: Switch from Faucet to More', () => {
    cy.get('#more-button').click();
    checkLinkOfButtons('FAQ', 'https://docs.aave.com/faq/');
    checkLinkOfButtons('Developers', 'https://docs.aave.com/portal/');
    checkLinkOfButtons('Github', 'https://github.com/aave/interface');
    checkLinkOfButtons('Switch to Aave Classic', 'https://classic.aave.com');
  });
});
