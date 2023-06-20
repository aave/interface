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

const waitStakedAmount = (assetName: string, checkAmount: string) => {
  cy.get(`[data-cy="stakedBox_${assetName}"]`)
    .find(`[data-cy="amountNative"]`)
    .then(($amount) => {
      cy.waitUntil(() => $amount.text() == checkAmount, {
        errorMsg: "staked amount wasn't updated",
        timeout: 70000,
        interval: 500,
      });
    });
};

testCases.forEach(
  (testCase: {
    assetName: { fullName: string; shortName: string; address: string };
    amount: number;
    checkAmount: string;
    tabValue: string;
  }) => {
    describe(`STAKE INTEGRATION SPEC, ${testCase.assetName.shortName} V2 MARKET`, () => {
      configEnvWithTenderlyMainnetFork({
        tokens: [{ tokenAddress: testCase.assetName.address }],
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
          waitStakedAmount(testCase.assetName.shortName, testCase.checkAmount);
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
          cy.get(`[data-cy="awaitCoolDownBtn_${testCase.assetName.shortName}"]`, {
            timeout: 70000,
          }).should('be.visible', { timeout: 50000 });
        });
      });
    });
  }
);
