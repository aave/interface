import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

describe('Changing the language', () => {
  configEnvWithTenderlyMainnetFork({});

  it('User must be able to change the language from English to Spanish', () => {
    cy.get('#settings-button').click();
    cy.contains('Language').click();
    cy.contains('Spanish').click();
    cy.reload();
    cy.get('a[href*="/markets/"]').contains('Mercados');
    cy.get('a[href*="/"]').contains('Panel');
  });

  it('User must be able to swith from Spanish to Franch', () => {
    cy.get('#settings-button').click();
    cy.contains('Idioma').click(); // Spanish translation of the word Language
    cy.contains('Francés').click();
    cy.reload();
    cy.get('a[href*="/markets/"]').contains('Marchés');
    cy.get('#more-button').contains('Plus');
  });
  it('User must be able to switch language back to English', () => {
    cy.get('#settings-button').click();
    cy.contains('Language').click();
    cy.contains('Anglais').click();
    cy.reload();
    cy.get('a[href*="/markets/"]').contains('Markets');
    cy.get('#more-button').contains('More');
  });
});
