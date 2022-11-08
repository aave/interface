import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

export const checkWidthOfText = () => {
  cy.get('[data-cy="vote-info-body"]').invoke('width').should('be.lt', 369);
};

describe('MOBILE RESOLUTION SPEC, AAVE V2 MARKET', () => {
  describe('CASE1:Check mobile menu', () => {
    const checkContent = (name: string, link: string) => {
      cy.get('[data-cy="mobile-menu"]').contains(name).should('have.attr', 'href', `${link}`);
    };
    configEnvWithTenderlyMainnetFork({});
    it('step1: Check content on menu', () => {
      cy.get('#settings-button-mobile').click();
      checkContent('Markets', '/markets/');
      checkContent('Governance', '/governance/');
      checkContent('Stake', '/staking/');
    });
    it('step2:Open proposal page and verify width of body', () => {
      cy.doFindMobileMenuElement('[data-cy="menuGovernance"]');
      cy.get('a[href*="/governance/proposal/109/"]')
        .contains('Whitelist Balancer’s Liquidity Mining Claim')
        .click();
      cy.contains('Proposal overview');
      checkWidthOfText();
    });
    it('step3:Open the latest proposal page and verify width of body', () => {
      cy.contains('Go Back').click();
      cy.get('a[href*="/governance/proposal/113/"]')
        .contains('Chaos Labs Risk Platform Proposal')
        .click();
      checkWidthOfText();
    });
  });
});
