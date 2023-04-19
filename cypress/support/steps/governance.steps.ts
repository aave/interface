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

export const delegate = (
  {
    asset,
    walletAddress,
    walletMask,
  }: {
    asset: { shortName: string; fullName: string };
    walletAddress: string;
    walletMask?: string;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = 'Delegate';

  return describe(`Delegate ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Setup delegation`, () => {
      cy.get('button:contains("Set up delegation")').click();
      cy.get(`[data-cy=Modal]`).find(`[data-cy='delegate-token-${_shortName}']`).click();
      cy.get(`[data-cy=Modal]`).find(`[data-cy=delegationAddress]`).type(walletAddress);
      cy.doConfirm(true, _actionName);
    });
    doCloseModal();
    if (walletMask) {
      it(`Check delegated power`, () => {
        cy.get(`p:contains("${walletMask}")`).should('have.length', 2);
      });
    }
  });
};

export const verifyPower = (
  {
    votingPower,
    propositionPower,
  }: {
    votingPower: string;
    propositionPower: string;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  return describe(`Verify power`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Voting power have to be ${votingPower}`, () => {
      cy.get(`[data-cy=voting-power]`).should('have.text', `${votingPower}`);
    });
    it(`Proposition power have to be ${propositionPower}`, () => {
      cy.get(`[data-cy=proposition-power]`).should('have.text', `${propositionPower}`);
    });
  });
};

export const revoke = (
  {
    asset,
    isChoice = true,
  }: {
    asset: { shortName: string; fullName: string };
    isChoice?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = 'Revoke';

  return describe(`Revoke both ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Revoke ${_shortName}`, () => {
      cy.get('button:contains("Revoke power")').click();
      if (isChoice)
        cy.get(`[data-cy=Modal]`).find(`[data-cy='delegate-token-${asset.shortName}']`).click();
      cy.doConfirm(true, _actionName);
    });
    doCloseModal();
  });
};
