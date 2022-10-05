import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

describe('Checking ABPT token modal on Staking page', () => {
  describe('CASE1:Open Stake page', () => {
    configEnvWithTenderlyMainnetFork({});
    it('Open Stake page', () => {
      cy.wait(2000);
      cy.get('[data-cy="menuStake"]').click();
    });
    it('Get ABP Token', () => {
      cy.contains('Stake ABPT').click();
      cy.get('[data-cy="getAbp-token"]').first().click();
    });
    it('Verify does Get ABP Token modal is opened', () => {
      cy.contains('Go to Balancer Pool').should(
        'have.attr',
        'href',
        'https://pools.balancer.exchange/#/pool/0xc697051d1c6296c24ae3bcef39aca743861d9a81/'
      );
    });
  });
});
