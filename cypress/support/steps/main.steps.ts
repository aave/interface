/// <reference types="cypress" />
import {
  setAmount,
  doConfirm,
  doSwapForRepay,
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
    asset: { shortName: string; fullName: string; wrapped: boolean };
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
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardSupplyView();
      cy.get(`[data-cy=dashboardSupplyListItem_${_shortName}]`)
        .find('button:contains("Supply")')

        .click();
      cy.get(
        `[data-cy=Modal] h2:contains("Supply ${asset.wrapped ? 'W' : ''}${_shortName}")`
      ).should('be.visible');
    });
    it(`Supply ${amount} amount for ${_shortName}`, () => {
      setAmount({
        amount,
        actionName: _actionName,
        assetName: _shortName,
        hasApproval,
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
  }: {
    asset: { shortName: string; fullName: string; wrapped: boolean };
    amount: number;
    apyType?: string;
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.borrow;

  return describe(`Borrow process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} borrow popup view`, () => {
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardBorrowView();
      cy.get(`[data-cy=dashboardBorrowListItem_${_shortName}]`)
        .find('button:contains("Borrow")')
        .click();
      cy.get(
        `[data-cy=Modal] h2:contains("Borrow ${asset.wrapped ? 'W' : ''}${_shortName}")`
      ).should('be.visible');
    });
    it(`Choose ${apyType} borrow option`, ()=>{
      switch (apyType) {
        case constants.borrowAPYType.variable:
          cy.get('[data-cy=Modal] [role=group] button p')
            .contains('Variable')
            .click({force: true});
          break;
        case constants.borrowAPYType.stable:
          cy.get('[data-cy=Modal] [role=group] button p')
            .contains('Stable')
            .click({force: true});
          break;
        default:
          break;
      }
    });
    it(`Borrow ${amount} amount for ${_shortName}`, () => {
      setAmount({
        amount,
        actionName: _actionName,
        assetName: _shortName,
        hasApproval,
      });
      doConfirm({
        hasApproval,
        actionName: _actionName,
        assetName: _shortName,
      });
    });
    // it(`Choose ${
    //   apyType === constants.borrowAPYType.variable ? 'Variable' : 'Stable'
    // } APY type`, () => {
    //   switch (apyType) {
    //     case constants.borrowAPYType.variable:
    //       cy.get('.InterestRateButton__inner p').contains('Variable APY').click();
    //       break;
    //     case constants.borrowAPYType.stable:
    //       cy.get('.InterestRateButton__inner p').contains('Stable APY').click();
    //       break;
    //     default:
    //       cy.get('.InterestRateButton__inner p').contains('Variable APY').click();
    //       break;
    //   }
    //   cy.get('.Button').contains('Continue').click();
    // });
    doCloseModal();
  });
};

export const repay = (
  {
    asset,
    apyType,
    amount,
    repayOption,
    assetForRepay,
    hasApproval = false,
  }: {
    asset: { shortName: string; fullName: string; wrapped: boolean };
    apyType: string;
    amount: number;
    repayOption: string;
    assetForRepay?: { shortName: string; fullName: string };
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.repay;
  const _shortNameAssetForRepay = assetForRepay ? assetForRepay.shortName : undefined;

  return describe(`Repay by ${repayOption} process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} repay popup view`, () => {
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardBorrowView();
      getDashBoardBorrowRow({assetName: _shortName, apyType})
        .find(`button:contains("Repay")`)
        .click();
      cy.get(
        `[data-cy=Modal] h2:contains("Repay ${asset.wrapped ? 'W' : ''}${_shortName}")`
      ).should('be.visible');
    });
    it(`Choose ${repayOption} repay option`, () => {
      switch (repayOption) {
        case constants.repayType.collateral:
          cy.get('[data-cy=Modal] button')
            .contains('Collateral')
            .click()
            .should('not.be.disabled');
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
    it(`Repay ${amount} amount for ${_shortName}, with ${repayOption} repay option`, () => {
      setAmount({
        amount,
        actionName: _actionName,
        assetName: _shortName,
        hasApproval,
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
  }: {
    asset: { shortName: string; fullName: string; wrapped: boolean };
    isCollateral: boolean;
    amount: number;
    hasApproval: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.withdraw;

  return describe(`Withdraw process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} Withdraw popup view`, () => {
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardSupplyView();
      cy.get(
        `[data-cy=dashboardSuppliedListItem_${_shortName}_${
          isCollateral ? 'Collateral' : 'NoCollateral'
        }]`
      )
        .find(`button:contains("Withdraw")`)
        .click();
      cy.get(
        `[data-cy=Modal] h2:contains("Withdraw ${asset.wrapped ? 'W' : ''}${_shortName}")`
      ).should('be.visible');
    });
    it(`Withdraw ${amount} amount for ${_shortName}`, () => {
      setAmount({
        amount,
        actionName: _actionName,
        assetName: _shortName,
        hasApproval,
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
    it(`Open change apy popup`, () =>{
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardBorrowView();
      getDashBoardBorrowRow({ assetName: _shortName, apyType })
        .find('[data-cy="apyButton"]')
        .click()
        .wait(2000);
    });
    it(`Change the ${_shortName} borrowing apr type from ${apyType} to ${newAPY}`, () => {
      cy.get(`.MuiPaper-root > .MuiList-root`)
        .contains(`APY, ${newAPY.toLowerCase()}`)
        .click();
    });
    it(`Make approve for ${_shortName}, on confirmation page`, () => {
      doConfirm({
        hasApproval,
        actionName: _actionName,
        assetName: "",
      });
    });
    doCloseModal();
  });
};

export const swap = (
  {
    fromAsset,
    toAsset,
    amount,
    hasApproval = true,
    failCase = false,
  }: {
    fromAsset: { shortName: string; fullName: string };
    toAsset: { shortName: string; fullName: string };
    amount: number;
    hasApproval: boolean;
    failCase?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortNameFrom = fromAsset.shortName;
  const _shortNameTo = toAsset.shortName;
  describe(`Swap ${amount} ${_shortNameFrom} to ${_shortNameTo}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open swap page`, () => {
      cy.get('.Menu strong').contains('Swap').click();
    });
    it(`Choosing swap options, ${amount} ${_shortNameFrom} to ${_shortNameTo}`, () => {
      cy.get('.AssetSelect__button')
        .first()
        .invoke('text')
        .then((text) => {
          if (text != _shortNameFrom) {
            cy.get('.AssetSelect__button').first().click();
            cy.get('.AssetSelect__content')
              .first()
              .get('.AssetSelect__option')
              .contains(_shortNameFrom)
              .click();
          }
        });
      cy.get(':nth-child(1) > .AmountFieldWithSelect__field-inner  [data-cy=amountInput]').type(
        amount.toString(),
        { delay: 0 }
      );
      cy.get('.AssetSelect__reverse .AssetSelect__button').click();
      cy.get('.AssetSelect__reverse .TokenIcon__name').contains(_shortNameTo).click();
    });
    if (failCase) {
      it(`Should not be clickable`, () => {
        cy.get('.Button').contains('Continue').parents('.Button').should('be.disabled');
      });
    } else {
      it('Click continue', () => {
        cy.get('.Button').contains('Continue').parents('.Button').should('not.be.disabled').click();
      });
      it(`Make approve for swap`, () => {
        doConfirm({ hasApproval, actionName: 'Swap' });
      });
    }
  });
};

export const changeCollateral = (
  {
    asset,
    isCollateralType,
    hasApproval = true,
  }: {
    asset: { shortName: string; fullName: string; wrapped: boolean };
    isCollateralType: boolean;
    hasApproval?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  return describe(`Switch collateral type from ${isCollateralType}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it('Open dashboard', () => {
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardSupplyView();
    });
    it('Open Switch type Modal', () => {
      getDashBoardDepositRow({ assetName: _shortName, isCollateralType })
        .find('.MuiSwitch-input ')
        .click();
      cy.get('[data-cy=Modal]').should('be.visible').wait(1000);
      if (isCollateralType) {
        cy.get(
          `[data-cy=Modal] h2:contains('Disable ${
            asset.wrapped ? '' : ''
          }${_shortName} as collateral')`
        ).should('be.visible');
      } else {
        cy.get(
          `[data-cy=Modal] h2:contains('Use ${
            asset.wrapped ? '' : ''
          }${_shortName} as collateral')`
        ).should('be.visible');
      }
    });
    it('Confirm switching', () => {
      if (isCollateralType) {
        cy.get('[data-cy=Modal] button')
          .contains(`Disable ${asset.wrapped ? 'W' : ''}${_shortName} as collateral`)
          .click();
      } else {
        cy.get('[data-cy=Modal] button')
          .contains(`Enable ${asset.wrapped ? 'W' : ''}${_shortName} as collateral`)
          .click();
      }
      cy.get("[data-cy=Modal] h2:contains('All done!')").should('be.visible');
      cy.get('[data-cy=Modal] [data-cy=CloseModalIcon]').click();
    });
  });
};

export const claimReward = (skip: SkipType, updateSkipStatus = false) => {
  return describe(`Claim reward`, () => {
    skipSetup({ skip, updateSkipStatus });
    it('Open dashboard page', () => {
      cy.get('.Menu strong').contains('dashboard').click();
    });
    it('Open claim confirmation page', () => {
      cy.get('.IncentiveWrapper .Link').contains('Claim').click();
    });
    it('Confirm claim', () => {
      doConfirm({ hasApproval: true });
    });
  });
};

export const changeCollateralNegative = (
  {
    asset,
    collateralType,
  }: {
    asset: { shortName: string; fullName: string };
    collateralType: string;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  return describe(`Switch collateral type negative`, () => {
    skipSetup({ skip, updateSkipStatus });
    it('Open dashboard', () => {
      cy.get('.Menu strong').contains('dashboard').click();
    });
    it('Switch type', () => {
      getDashBoardDepositRow({ assetName: _shortName, collateralType })
        .find('.Switcher__swiper')
        .click();
    });
    it('Confirm switching', () => {
      cy.get('.TxConfirmationView')
        .find('span')
        .contains(
          "You can't switch usage as collateral mode for this currency, because it will cause collateral call"
        );
    });
  });
};
