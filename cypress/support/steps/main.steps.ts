/// <reference types="cypress" />
import {
  setAmount,
  doConfirm,
  getDashBoardBorrowRow,
  getDashBoardDepositRow,
  doCloseModal,
  doSwitchToDashboardBorrowView,
  doSwitchToDashboardSupplyView,
} from './actions.steps';
import constants from '../../fixtures/constans.json';

type SkipType = {
  set: (val: boolean) => void;
  get: () => boolean;
};

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

export const supply = (
  {
    asset,
    amount,
    hasApproval = true,
  }: {
    asset: { shortName: string; fullName: string };
    amount: number;
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.supply;

  return describe(`Supply process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} supply popup view`, () => {
      doSwitchToDashboardSupplyView();
      cy.get(`[data-cy='dashboardSupplyListItem_${_shortName.toUpperCase()}']`)
        .find('button:contains("Supply")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Supply ${_shortName}")`).should('be.visible');
    });
    it(`Supply ${amount} amount for ${_shortName}`, () => {
      setAmount({
        amount,
      });
      doConfirm({
        hasApproval,
        actionName: _actionName,
        assetName: _shortName,
      });
    });
    doCloseModal();
  });
};

export const borrow = (
  {
    asset,
    amount,
    apyType,
    hasApproval = true,
    isRisk = false,
  }: {
    asset: { shortName: string; fullName: string };
    amount: number;
    apyType?: string;
    hasApproval: boolean;
    isRisk?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.borrow;

  return describe(`Borrow process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} borrow popup view`, () => {
      doSwitchToDashboardBorrowView();
      cy.wait(4000);
      cy.get(`[data-cy='dashboardBorrowListItem_${_shortName.toUpperCase()}']`)
        .contains('Borrow')
        .should('not.be.disabled')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Borrow ${_shortName}")`).should('be.visible');
    });
    it(`Choose ${apyType} borrow option`, () => {
      switch (apyType) {
        case constants.borrowAPYType.variable:
          cy.get('[data-cy=Modal] [role=group] button p')
            .contains('Variable')
            .click({ force: true });
          break;
        case constants.borrowAPYType.stable:
          cy.get('[data-cy=Modal] [role=group] button p').contains('Stable').click({ force: true });
          break;
        default:
          break;
      }
    });
    it(`Borrow ${amount} amount for ${_shortName}`, () => {
      setAmount({
        amount,
      });
    });
    if (isRisk) {
      it(`Click risk checkbox`, () => {
        cy.get('[data-cy=Modal]').find(`[data-cy="risk-checkbox"]`).click();
      });
    }
    it(`Confirmation process`, () => {
      doConfirm({
        hasApproval,
        actionName: _actionName,
        assetName: _shortName,
      });
    });
    doCloseModal();
  });
};

export const repay = (
  {
    asset,
    apyType,
    amount,
    repayOption,
    repayableAsset,
    hasApproval = false,
  }: {
    asset: { shortName: string; fullName: string };
    apyType: string;
    amount: number;
    repayOption: string;
    repayableAsset?: { shortName: string };
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.repay;

  return describe(`Repay by ${repayOption} process for ${_shortName} by ${
    repayableAsset ? repayableAsset.shortName : _shortName
  }`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} repay popup view`, () => {
      doSwitchToDashboardBorrowView();
      getDashBoardBorrowRow({ assetName: _shortName, apyType })
        .find(`button:contains("Repay")`)
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Repay ${_shortName}")`).should('be.visible');
    });
    it(`Choose ${repayOption} repay option`, () => {
      switch (repayOption) {
        case constants.repayType.collateral:
          cy.get('[data-cy=Modal] button').contains('Collateral').click().should('not.be.disabled');
          break;
        case constants.repayType.wallet:
          cy.get('[data-cy=Modal] button')
            .contains('Wallet balance')
            .click()
            .should('not.be.disabled');
          break;
        case constants.repayType.default:
          break;
        default:
          cy.get('[data-cy=Modal] button')
            .contains('Wallet balance')
            .click()
            .should('not.be.disabled');
          break;
      }
    });
    if (repayableAsset) {
      it(`Choose ${repayableAsset.shortName} as option to repay`, () => {
        cy.get('[data-cy=Modal] ').as('Modal');
        cy.get('@Modal').get('[data-cy=assetSelect]').click();
        cy.get('@Modal')
          .get(`[data-cy='assetsSelectOption_${repayableAsset.shortName.toUpperCase()}']`)
          .click();
        cy.get('@Modal').get('[data-cy=assetSelect]').contains(repayableAsset.shortName);
      });
    }
    it(`Repay ${amount} amount for ${_shortName}, with ${repayOption} repay option`, () => {
      setAmount({
        amount,
      });
      doConfirm({
        hasApproval,
        actionName: _actionName,
        assetName: _shortName,
      });
    });
    doCloseModal();
  });
};

export const withdraw = (
  {
    asset,
    isCollateral,
    amount,
    hasApproval = false,
    forWrapped = false,
    isRisk = false,
  }: {
    asset: { shortName: string; fullName: string };
    isCollateral: boolean;
    amount: number;
    hasApproval: boolean;
    forWrapped?: boolean;
    isRisk?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.withdraw;

  return describe(`Withdraw process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} Withdraw popup view`, () => {
      doSwitchToDashboardSupplyView();
      getDashBoardDepositRow({ assetName: _shortName, isCollateralType: isCollateral })
        .find(`button:contains("Withdraw")`)
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Withdraw ${_shortName}")`).should('be.visible');
    });
    it(`Choose ${forWrapped ? 'usual token' : 'wrapped token'}`, () => {
      if (forWrapped) {
        cy.get('[data-cy=Modal]').get('[data-cy=wrappedSwitcher]').click();
      }
      cy.get('[data-cy=Modal]')
        .get('[data-cy=inputAsset]')
        .contains(`${forWrapped ? 'W' + _shortName : _shortName}`);
    });
    it(`Withdraw ${amount} amount for ${_shortName}`, () => {
      setAmount({
        amount,
      });
    });
    if (isRisk) {
      it(`Click risk checkbox`, () => {
        cy.get('[data-cy=Modal]').find(`[data-cy="risk-checkbox"]`).click();
      });
    }
    it(`Confirmation process`, () => {
      doConfirm({
        hasApproval,
        actionName: _actionName,
        assetName: forWrapped ? 'W' + _shortName : _shortName,
      });
    });
    doCloseModal();
  });
};

export const changeBorrowType = (
  {
    asset,
    apyType,
    newAPY,
    hasApproval = true,
  }: {
    asset: { shortName: string; fullName: string };
    apyType: string;
    newAPY: string;
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.switchApy;

  describe('Change APY of borrowing', () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open change apy popup`, () => {
      doSwitchToDashboardBorrowView();
      getDashBoardBorrowRow({ assetName: _shortName, apyType })
        .find(`[data-cy="apyButton_${apyType}"]`)
        .click();
    });
    it(`Change the ${_shortName} borrowing apr type from ${apyType} to ${newAPY}`, () => {
      cy.get(`[data-cy="apyMenu_${apyType}"]`).contains(`APY, ${newAPY.toLowerCase()}`).click();
    });
    it(`Make approve for ${_shortName}, on confirmation page`, () => {
      doConfirm({
        hasApproval,
        actionName: _actionName,
      });
    });
    doCloseModal();
  });
};

export const swap = (
  {
    fromAsset,
    toAsset,
    isCollateralFromAsset,
    amount,
    hasApproval = true,
  }: {
    fromAsset: { shortName: string; fullName: string };
    toAsset: { shortName: string; fullName: string };
    isCollateralFromAsset: boolean;
    amount: number;
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortNameFrom = fromAsset.shortName;
  const _shortNameTo = toAsset.shortName;
  const _actionName = 'Swap';

  describe(`Swap ${amount} ${_shortNameFrom} to ${_shortNameTo}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open Swap modal for ${_shortNameFrom}`, () => {
      doSwitchToDashboardSupplyView();
      getDashBoardDepositRow({ assetName: _shortNameFrom, isCollateralType: isCollateralFromAsset })
        .find(`[data-cy=swapButton]`)
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Swap ${_shortNameFrom}")`).should('be.visible');
    });
    it('Choose swapping options: swap to asset', () => {
      cy.get('[data-cy=Modal]').as('Modal');
      cy.get('@Modal').find('[data-cy=assetSelect]').click();
      cy.get(`[data-cy="assetsSelectOption_${_shortNameTo.toUpperCase()}"]`, { timeout: 10000 })
        .should('be.visible')
        .click();
      cy.get(`[data-cy="assetsSelectedOption_${_shortNameTo.toUpperCase()}"]`, {
        timeout: 10000,
      }).should('be.visible', { timeout: 10000 });
    });
    it('Make approve', () => {
      setAmount({
        amount,
      });
      doConfirm({
        hasApproval,
        actionName: _actionName,
      });
    });
    doCloseModal();
  });
};

export const changeCollateral = (
  {
    asset,
    isCollateralType,
  }: {
    asset: { shortName: string; fullName: string };
    isCollateralType: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  return describe(`Switch collateral type from ${isCollateralType}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it('Open dashboard', () => {
      doSwitchToDashboardSupplyView();
    });
    it('Open Switch type Modal', () => {
      getDashBoardDepositRow({ assetName: _shortName, isCollateralType })
        .find('.MuiSwitch-input ')
        .click();
      cy.get('[data-cy=Modal]').should('be.visible');
      cy.get(`[data-cy=Modal] h2:contains('Review tx ${_shortName}')`).should('be.visible');
    });
    it('Confirm switching', () => {
      if (isCollateralType) {
        cy.get('[data-cy=actionButton]')
          .contains(`Disable ${_shortName} as collateral`)
          .wait(3000)
          .click();
      } else {
        cy.get('[data-cy=actionButton]')
          .contains(`Enable ${_shortName} as collateral`)
          .wait(3000)
          .click();
      }
      cy.get("[data-cy=Modal] h2:contains('All done!')").should('be.visible');
    });
    doCloseModal();
  });
};

export const claimReward = (
  {
    asset,
  }: {
    asset: { shortName: string; fullName: string };
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  return describe(`Claim reward`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open dashboard`, () => {
      doSwitchToDashboardSupplyView();
    });
    it(`Open claim modal`, () => {
      cy.get('[data-cy=Claim_Box]').should('be.visible');
      cy.get('[data-cy=Dashboard_Claim_Button]').click();
    });
    it('Confirm claim', () => {
      doConfirm({
        hasApproval: true,
        actionName: 'Claim',
        assetName: asset.shortName,
      });
    });
    doCloseModal();
  });
};

export const changeCollateralNegative = (
  {
    asset,
    isCollateralType,
  }: {
    asset: { shortName: string; fullName: string };
    isCollateralType: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  return describe(`Switch collateral type negative`, () => {
    skipSetup({ skip, updateSkipStatus });
    it('Switch type', () => {
      doSwitchToDashboardSupplyView();
      getDashBoardDepositRow({ assetName: _shortName, isCollateralType })
        .find('.MuiSwitch-input ')
        .click();
    });
    it(`Check that switch type unavailable`, () => {
      cy.get('[data-cy=Modal]').contains(
        'You can not switch usage as collateral mode for this currency, because it will cause collateral call'
      );
      cy.get('[data-cy=actionButton]').should('be.disabled');
    });
    it(`Close Modal`, () => {
      cy.get('[data-cy=Modal]').get('[data-cy=CloseModalIcon]').click();
    });
  });
};
