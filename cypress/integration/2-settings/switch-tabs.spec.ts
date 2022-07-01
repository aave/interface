import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

describe('Switch tabs in header', () => {
  configEnvWithTenderlyMainnetFork({});

  it('step1:Switch tabs on Dashboard page', () => {
    cy.get(`button[value="borrow"]`).click();
    cy.contains('Your borrows');
    cy.get(`button[value="supply"]`).click();
    cy.contains('Your supplies');
  });

  it('step2: Switch tabs on Markets page', () => {
    cy.get('a[href*="/markets/"]').click();
  });
});
