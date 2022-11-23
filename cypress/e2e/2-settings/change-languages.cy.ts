import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

const switchLanguageStep = (language: string, languageTo: string) => {
  it(`step1: Switch language from ${language} to ${languageTo}`, () => {
    cy.get('#settings-button').click();
    cy.contains(language).click();
    cy.contains(languageTo).click();
    cy.get('body').click(0, 0);
  });
};

const verifyTranslation = (markets: string, More: string) => {
  it(`step2: Verify translation on ${markets} and on ${More}`, () => {
    cy.get('a[href*="/markets/"]').contains(markets);
    cy.get('#more-button').contains(More);
  });
};
export const verifyTranslationOnMarketsPage = (totalBorrows: string, totalMarketSize: string) => {
  it(`step3:Verify translation on the Markets page on the ${totalBorrows} and on the ${totalMarketSize}`, () => {
    cy.get('a[href*="/markets/"]').click();
    cy.contains(totalBorrows);
    cy.contains(totalMarketSize);
  });
};

describe.skip('Manipulation on the language', () => {
  describe('CASE1:Changing the language from English to Spanish', () => {
    configEnvWithTenderlyMainnetFork({});
    switchLanguageStep('Language', 'Spanish');
    verifyTranslation('Mercados', 'Más');
    verifyTranslationOnMarketsPage('Total de préstamos', 'Tamaño total del mercado');
  });

  describe('CASE2: Changing the Language from Spanish to French', () => {
    switchLanguageStep('Idioma', 'Francés');
    verifyTranslation('Marchés', 'Plus');
    verifyTranslationOnMarketsPage('Total des emprunts', 'Taille totale du marché');
  });

  describe('CASE3: Change language from French to English', () => {
    switchLanguageStep('Language', 'Anglais');
    verifyTranslation('Markets', 'More');
    verifyTranslationOnMarketsPage('Total borrows', 'Total market size');
  });
});
