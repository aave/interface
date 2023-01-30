import assets from '../../../fixtures/assets.json';
import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import { doCloseModal } from '../../../support/steps/main.steps';

const testCases = [
  {
    assetName: assets.staking.AAVE,
    amount: 1000,
    checkAmount: '1,000.00',
    tabValue: 'aave',
  },
  {
    assetName: assets.staking.ABPT,
    amount: 1000,
    checkAmount: '1,000.00',
    tabValue: 'bpt',
  },
];

testCases.forEach(
  (
    testCase: {
      assetName: { fullName: string; shortName: string; address: string };
      amount: number;
      checkAmount: string;
      tabValue: string;
    },
    timeout = 10000
  ) => {
    describe(`STAKE INTEGRATION SPEC, ${testCase.assetName.shortName} V2 MARKET`, () => {
      configEnvWithTenderlyMainnetFork({
        tokens: [{ address: testCase.assetName.address }],
      });
      describe(`Stake amount`, () => {
        it(`Open staking page`, () => {
          cy.get('[data-cy="menuStake"]').click();

          cy.get(`button[value="${testCase.tabValue}"]`).then(($clickable) => {
            if ($clickable.prop('disabled')) return;
            $clickable.click();
          });
        });
        it(`Open stake modal`, () => {
          cy.get(`button[data-cy="stakeBtn_${testCase.assetName.shortName}"]`)
            .should('not.be.disabled')
            .click();
        });
        it(`Set amount`, () => {
          cy.setAmount(testCase.amount, false);
          cy.doConfirm(false, 'Stake');
        });
        doCloseModal();
        it(`Check staked amount`, () => {
          cy.wait(timeout);
          cy.get(`[data-cy="stakedBox_${testCase.assetName.shortName}"]`)
            .find(`[data-cy="amountNative"]`)
            .should('have.text', testCase.checkAmount);
          cy.get(`[data-cy="stakedBox_${testCase.assetName.shortName}"]`)
            .find(`[data-cy="amountUSD"]`)
            .should('not.have.text', '$ 0');
          cy.get(`[data-cy="rewardBox_${testCase.assetName.shortName}"]`)
            .find(`[data-cy="amountNative"]`)
            .should('not.have.text', '0');
          cy.get(`[data-cy="rewardBox_${testCase.assetName.shortName}"]`)
            .find(`[data-cy="amountUSD"]`)
            .should('not.have.text', ' $0');
        });
      });
      describe(`Claim reward`, () => {
        it(`Open claim popup`, () => {
          cy.get(`[data-cy="claimBtn_${testCase.assetName.shortName}"]`).click();
        });
        it(`Confirm`, () => {
          cy.doConfirm(true, `STAKE ${testCase.assetName.shortName}`);
        });
        doCloseModal();
      });
      describe(`Activate cooldown`, () => {
        it(`open activate cooldown`, () => {
          cy.get(`[data-cy="coolDownBtn_${testCase.assetName.shortName}"]`).click();
        });
        it(`Confirm`, () => {
          cy.get(`[data-cy="cooldownAcceptCheckbox"]`).click();
          cy.doConfirm(true, 'Cooldown to unstake');
        });
        doCloseModal();
        it(`Check cooldown activation`, () => {
          cy.wait(timeout);
          cy.get(`[data-cy="awaitCoolDownBtn_${testCase.assetName.shortName}"]`).should(
            'be.disabled',
            { timeout: 50000 }
          );
        });
      });
    });
  }
);
