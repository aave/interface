import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

const checkWidthOfText = (maxWidth: number) => {
  cy.get('[data-cy="vote-info-body"]').invoke('width').should('be.lt', maxWidth);
};

const checkContent = (name: string, link: string) => {
  cy.get('[data-cy="mobile-menu"]').contains(name).should('have.attr', 'href', `${link}`);
};

const doFindMobileMenuElement = (value: string) => {
  cy.get('[data-cy="mobile-menu"]').contains(value).click();
};

const switchLanguage = (selector: string) => {
  cy.get('[data-cy="mobile-menu"]').contains('Language').click({ force: true });
  cy.get('[data-cy="mobile-menu"]').contains(selector).click();
};

const backgroundColour = (color: string) => {
  cy.get('body').should('have.css', 'background-color', `${color}`);
};

describe('MOBILE RESOLUTION SPEC, AAVE V2 MARKET', () => {
  configEnvWithTenderlyMainnetFork({});
  describe('CASE1:Check mobile menu', () => {
    it('Check content on menu', () => {
      cy.get('#settings-button-mobile').click();
      checkContent('Markets', '/markets/');
      checkContent('Governance', '/governance/');
      checkContent('Stake', '/staking/');
    });
  });

  describe('CASE2:Check proposal pages', () => {
    const _maxResolution = 312;
    it('Verify width of proposal body with long text', () => {
      cy.get('[data-cy="mobile-menu"]').find('[data-cy="menuGovernance"]').click();
      cy.get('a[href*="/governance/proposal/109/"]')
        .contains('Whitelist Balancer’s Liquidity Mining Claim')
        .click();
      cy.contains('Proposal overview');
      checkWidthOfText(_maxResolution);
    });
    it('Verify width of latest proposal body with long text', () => {
      cy.contains('Go Back').click();
      cy.get('a[href*="/governance/proposal/113/"]')
        .contains('Chaos Labs Risk Platform Proposal')
        .click();
      checkWidthOfText(_maxResolution);
    });
  });

  describe('CASE3:Switch language and check translation', () => {
    it('Open menu and switch language', () => {
      cy.get('#settings-button-mobile').click();
      switchLanguage('Spanish');
      cy.contains('Seleccionar idioma');
      doFindMobileMenuElement('Inglés');
      doFindMobileMenuElement('Select language');
    });
  });

  describe('CASE4: Switch to Dark mode', () => {
    it('step1:Switch to dark mode', () => {
      doFindMobileMenuElement('Dashboard');
      cy.get('#settings-button-mobile').click();
      doFindMobileMenuElement('Dark mode');
      doFindMobileMenuElement('Dashboard');
    });
    it('step2: Check background color(dark)', () => {
      backgroundColour('rgb(27, 32, 48)');
    });
  });

  describe('CASE5:Open Markets page and close it', () => {
    it('Open Markets page and then open menu and close menu', () => {
      cy.get('#settings-button-mobile').click();
      doFindMobileMenuElement('Markets');
      cy.get('#settings-button-mobile').click();
      cy.get('[data-cy="closeMenuMobile"]').click();
      cy.contains('Total market size');
    });
  });
});
