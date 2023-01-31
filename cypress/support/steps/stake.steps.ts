import { doCloseModal } from './main.steps';

const timeout = 10000;

export const stake = ({
  assetName,
  amount,
  checkAmount,
  tabValue,
}: {
  assetName: { fullName: string; shortName: string; address: string };
  amount: number;
  checkAmount: string;
  tabValue: string;
}) => {
  return describe(`Stake amount`, () => {
    it(`Open staking page`, () => {
      cy.get('[data-cy="menuStake"]').click();

      cy.get(`button[value="${tabValue}"]`).then(($clickable) => {
        if ($clickable.prop('disabled')) return;
        $clickable.click();
      });
    });
    it(`Open stake modal`, () => {
      cy.get(`button[data-cy="stakeBtn_${assetName.shortName}"]`).should('not.be.disabled').click();
    });
    it(`Set amount`, () => {
      cy.setAmount(amount, false);
      cy.doConfirm(false, 'Stake');
    });
    doCloseModal();
    it(`Check staked amount`, () => {
      cy.wait(timeout);
      cy.get(`[data-cy="stakedBox_${assetName.shortName}"]`)
        .find(`[data-cy="amountNative"]`)
        .should('have.text', checkAmount);
      cy.get(`[data-cy="stakedBox_${assetName.shortName}"]`)
        .find(`[data-cy="amountUSD"]`)
        .should('not.have.text', '$ 0');
      cy.get(`[data-cy="rewardBox_${assetName.shortName}"]`)
        .find(`[data-cy="amountNative"]`)
        .should('not.have.text', '0');
      cy.get(`[data-cy="rewardBox_${assetName.shortName}"]`)
        .find(`[data-cy="amountUSD"]`)
        .should('not.have.text', ' $0');
    });
  });
};

export const claimReward = ({
  assetName,
}: {
  assetName: { fullName: string; shortName: string; address: string };
}) => {
  return describe(`Claim reward`, () => {
    it(`Open claim popup`, () => {
      cy.get(`[data-cy="claimBtn_${assetName.shortName}"]`).click();
    });
    it(`Confirm`, () => {
      cy.doConfirm(true, `STAKE ${assetName.shortName}`);
    });
    doCloseModal();
  });
};

export const activateCooldown = ({
  assetName,
}: {
  assetName: { fullName: string; shortName: string; address: string };
}) => {
  return describe(`Activate cooldown`, () => {
    it(`open activate cooldown`, () => {
      cy.get(`[data-cy="coolDownBtn_${assetName.shortName}"]`).click();
    });
    it(`Confirm`, () => {
      cy.get(`[data-cy="cooldownAcceptCheckbox"]`).click();
      cy.doConfirm(true, 'Cooldown to unstake');
    });
    doCloseModal();
    it(`Check cooldown activation`, () => {
      cy.wait(timeout);
      cy.get(`[data-cy="awaitCoolDownBtn_${assetName.shortName}"]`).should('be.disabled');
    });
  });
};
