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

describe.skip('Switch tabs in header', () => {
  const checkLinkOfButtons = (name: string, link: string) => {
    cy.contains(name).should('have.attr', 'href', `${link}`);
  };

  configEnvWithTenderlyMainnetFork({});

  it('step1:Switch tabs from Dashboard to Markets page', () => {
    verifyElementsOnMarketsPage('Total borrows', 'Total market size');
  });

  it('step2: Switch from Markets to Stake ', () => {
    cy.get('a[href*="/staking/"]').click();
    cy.contains('Staking');
  });

  it('step3: Switch from Stake to Governance', () => {
    cy.get('a[href*="/governance/"]').click();
    cy.contains('Proposals');
  });

  it('step4: Switch from Governance to More', () => {
    cy.get('#more-button').click();
    checkLinkOfButtons('FAQ', 'https://docs.aave.com/faq/governance');
    checkLinkOfButtons('Developers', 'https://docs.aave.com/portal/');
    checkLinkOfButtons('Github', 'https://github.com/aave/interface');
  });
});
