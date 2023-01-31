import constants from '../../fixtures/constans.json';
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

export const faucet = (
  {
    asset,
  }: {
    asset: { shortName: string; fullName: string };
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.faucet;

  return describe(`Faucet process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Visit faucet page`, () => {
      cy.get(`a[href="/faucet/"]`).click();
    });
    it(`Open ${_shortName} faucet popup view`, () => {
      cy.doSwitchToDashboardSupplyView();
      cy.get(`[data-cy='faucetListItem_${_shortName.toUpperCase()}']`)
        .find('button:contains("Faucet")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Faucet ${_shortName}")`).should('be.visible');
    });
    it(`Faucet confirm for ${_shortName}`, () => {
      cy.doConfirm(true, _actionName, _shortName);
    });
    doCloseModal();
    it(`Go to dashboard`, () => {
      cy.get(`a[href="/"]`).last().click();
    });
  });
};
