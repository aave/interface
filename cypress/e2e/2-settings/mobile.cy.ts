import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

describe('MOBILE RESOLUTION SPEC, AAVE V2 MARKET', () => {
  describe('CASE1:Check mobile menu', () => {
    const checkContent = (name: string, link: string) => {
      // cy.get;
      // cy.get(`#unified-runner`).iframe().find('#target').type('HELLO WORLD');
      // cy.getIframe().get('menu').contains(name).should('have.attr', 'href', `${link}`);
      cy.get('[data-cy="mobile-menu"]').contains(name).should('have.attr', 'href', `${link}`);
    };
    configEnvWithTenderlyMainnetFork({});
    it('step1: Check content on menu', () => {
      cy.get('#settings-button-mobile').click();
      checkContent('Markets', '/markets/');
      checkContent('Governance', '/governance/');
      checkContent('Stake', '/staking/');
    });
    it('step2:Open proposal page and verify widh of body', () => {
      cy.doFindMobileMenuElement('[data-cy="menuGovernance"]');
      cy.find('h3').contains('Whitelist Balancer’s Liquidity Mining Claim').click();
    });
  });
});
