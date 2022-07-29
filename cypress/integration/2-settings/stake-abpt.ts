import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

describe('Checking ABPT token modal on Staking page', () => {
  describe('CASE1:Open Stake page', () => {
    configEnvWithTenderlyMainnetFork({});

    it('step1:Open Stake page', () => {
      cy.get('[data-cy="menuStake"]').click();
    });
  });

  describe('CASE2:GET ABP Token', () => {
    it('step2:Get ABP Token', () => {
      cy.contains('Stake ABPT').click();
      cy.get('#getAbp-token').click();
    });

    it('step3:Verify does Get ABP Token modal is opened', () => {
      cy.contains('Go to Balancer Pool').should(
        'have.attr',
        'href',
        'https://pools.balancer.exchange/#/pool/0xc697051d1c6296c24ae3bcef39aca743861d9a81/'
      );
    });
  });
});
