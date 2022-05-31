import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

const switchLanguageStep = (language: string, languageTo: string) => {
  it(`step1: Switch language from English to ${languageTo}`, () => {
    cy.get('#settings-button').click();
    cy.contains(language).click();
    cy.contains(languageTo).click();
    cy.get('body').click(0, 0);
  });
};

const verifyTranslation = (markets: string, dashboard: string) => {
  cy.get('a[href*="/markets/"]').contains(markets);
  cy.get('a[href*="/"]').contains(dashboard);
};

describe('CASE1:Changing the language to Spanish', () => {
  configEnvWithTenderlyMainnetFork({});

  switchLanguageStep('Language', 'Spanish');

  it('step2: Verify Spanish translation', () => {
    verifyTranslation('Mercados', 'Panel');
  });
});

describe('CASE2: Changing the Language from Spanish to French', () => {
  it('step1: Change language from Spanish to French', () => {
    switchLanguageStep('Idioma', 'Francés');
  });

  it('step2:Verify the French Translation', () => {
    verifyTranslation('Marchés', 'Plus');
  });
});

describe('CASE3: Change language from French to English', () => {
  it('step1:Change the language from French to English', () => {
    switchLanguageStep('Language', 'Anglais');
  });

  it('step2:Verify English Translation', () => {
    verifyTranslation('Markets', 'More');
  });
});
