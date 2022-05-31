import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';


const switchLanguageStep = (language:string, languageTo: string) => {
  cy.get('#settings-button').click();
  cy.contains(language).click();
  cy.contains(languageTo).click();
  cy.reload();
}

describe('Changing the language', () => {
  configEnvWithTenderlyMainnetFork({});

  describe('CASE1: description', ()=>{
    it('step1', ()=>{

    })
    it('verification ', ()=>{

    });
  });

  it('CASE: SWITCH LANGUAGE FROM ENG TO SPANISH', () => {
    switchLanguageStep('Language','Spanish');
  });

  it('CASE2:VERIFY SPANISH TRANSLATION', () => {
    cy.get('a[href*="/markets/"]').contains('Mercados');
    cy.get('a[href*="/"]').contains('Panel');
  });

  it('CASE3:SWITCH LANGUAGE FROM SPANISH TO FRENCH', () => {
    cy.get('#settings-button').click();
    cy.contains('Idioma').click(); // Spanish translation of the word Language
    cy.contains('Francés').click();
    cy.reload();
  });

  it('CASE4:VERIFY FRENCH TRANSLATION', () => {
    cy.get('a[href*="/markets/"]').contains('Marchés');
    cy.get('#more-button').contains('Plus');
  });

  it('CASE5: SWITCH LANGUAGE FROM FRENCH TO ENGLISH', () => {
    cy.get('#settings-button').click();
    cy.contains('Language').click();
    cy.contains('Anglais').click();
    cy.reload();
  });

  it('CASE6:VEIRFY ENGLISH TRANSLATION', () => {
    cy.get('a[href*="/markets/"]').contains('Markets');
    cy.get('#more-button').contains('More');
  });
});
