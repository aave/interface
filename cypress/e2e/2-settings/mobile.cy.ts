import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

const checkWidthOfText = (maxWidth: number) => {
  cy.get('[data-cy="vote-info-body"]').invoke('width').should('be.lt', maxWidth);
};

const checkContent = (name: string, link: string) => {
  cy.get('[data-cy="mobile-menu"]').contains(name).should('have.attr', 'href', `${link}`);
};

const doFindMobileMenuElement = (value: string) => {
  return cy.get('[data-cy="mobile-menu"]').find(value).click();
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
      doFindMobileMenuElement('[data-cy="menuGovernance"]');
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
});
