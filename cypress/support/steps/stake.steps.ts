import { doCloseModal } from './main.steps';

type SkipType = {
  set: (val: boolean) => void;
  get: () => boolean;
};

/**
 * This skip all test steps if previous one was failed
 */
const skipSetup = ({ skip, updateSkipStatus }: { skip: SkipType; updateSkipStatus: boolean }) => {
  before(function () {
    if (skip.get()) {
      this.skip();
    }
  });
  afterEach(function onAfterEach() {
    if ((this.currentTest as Mocha.Test).state === 'failed' && updateSkipStatus) {
      skip.set(true);
    }
  });
};

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

export const stake = (
  {
    asset,
    amount,
    checkAmount,
    tabValue,
    hasApproval,
  }: {
    asset: { fullName: string; shortName: string; address: string };
    amount: number;
    checkAmount: string;
    tabValue: string;
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = 'Stake';

  return describe(`Stake ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open staking page`, () => {
      cy.get('[data-cy="menuStake"]').click();

      cy.get(`button[value="${tabValue}"]`).then(($clickable) => {
        if ($clickable.prop('disabled')) return;
        $clickable.click();
      });
    });
    it(`Open stake modal`, () => {
      cy.get(`button[data-cy="stakeBtn_${asset.shortName}"]`).should('not.be.disabled').click();
    });
    it(`Set amount`, () => {
      cy.setAmount(amount, false);
      cy.doConfirm(hasApproval, _actionName);
    });
    doCloseModal();
    it(`Check staked amount`, () => {
      waitStakedAmount(asset.shortName, checkAmount);
      cy.get(`[data-cy="stakedBox_${asset.shortName}"]`)
        .find(`[data-cy="amountNative"]`)
        .should('have.text', checkAmount);
      cy.get(`[data-cy="stakedBox_${asset.shortName}"]`)
        .find(`[data-cy="amountUSD"]`)
        .should('not.have.text', '$ 0');
      cy.get(`[data-cy="rewardBox_${asset.shortName}"]`)
        .find(`[data-cy="amountNative"]`)
        .should('not.have.text', '0');
      cy.get(`[data-cy="rewardBox_${asset.shortName}"]`)
        .find(`[data-cy="amountUSD"]`)
        .should('not.have.text', ' $0');
    });
  });
};

export const claimReward = (
  {
    asset,
  }: {
    asset: { fullName: string; shortName: string; address: string };
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = `STAKE ${asset.shortName}`;

  return describe(`Stake ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open claim popup`, () => {
      cy.get(`[data-cy="claimBtn_${asset.shortName}"]`).click();
    });
    it(`Confirm`, () => {
      cy.doConfirm(true, _actionName);
    });
    doCloseModal();
  });
};

export const activateCooldown = (
  {
    asset,
  }: {
    asset: { fullName: string; shortName: string; address: string };
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = `Cooldown to unstake`;

  return describe(`Stake ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`open activate cooldown`, () => {
      cy.get(`[data-cy="coolDownBtn_${asset.shortName}"]`).click();
    });
    it(`Confirm`, () => {
      cy.get(`[data-cy="cooldownAcceptCheckbox"]`).click();
      cy.doConfirm(true, _actionName);
    });
    doCloseModal();
    it(`Check cooldown activation`, () => {
      cy.get(`[data-cy="awaitCoolDownBtn_${asset.shortName}"]`, {
        timeout: 70000,
      }).should('be.visible', { timeout: 50000 });
    });
  });
};

export const reCallCooldown = (
  {
    asset,
  }: {
    asset: { fullName: string; shortName: string; address: string };
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = `Cooldown to unstake`;

  return describe(`Stake ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`open reactivate cooldown`, () => {
      cy.get(`[data-cy="reCoolDownBtn_${asset.shortName}"]`).click();
    });
    it(`Confirm`, () => {
      cy.get(`[data-cy="cooldownAcceptCheckbox"]`).click();
      cy.doConfirm(true, _actionName);
    });
    doCloseModal();
    it(`Check recooldown button is hidden`, () => {
      cy.get(`[data-cy="reCoolDownBtn_${asset.shortName}"]`, { timeout: 70000 }).should(
        'not.exist',
        { timeout: 50000 }
      );
    });
  });
};
