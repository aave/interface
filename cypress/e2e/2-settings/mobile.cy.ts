import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

export const checkWidthOfText = (title: string, width: string) => {
  cy.contains(title).should('have.css', 'width', `${width}`);
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
      cy.contains('Whitelist Balancer’s Liquidity Mining Claim').click();
      cy.contains('Proposal overview');
      checkWidthOfText(
        'Balancer DAO seeks to retrieve around 1,500 stkAAVE from several Linear Pools.',
        '336px'
      );
      checkWidthOfText('It transfers the stkAAVE rewards to the Balancer Multisig', '296px');
    });
  });
});
