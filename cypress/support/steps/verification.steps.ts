/// <reference types="cypress" />
import { getDashBoardBorrowRow, getDashBoardDepositRow } from './actions.steps';
import constants from '../../fixtures/constans.json';

type SkipType = {
  set: (val: boolean) => void;
  get: () => boolean;
};

const skipSetup = (skip: any) => {
  before(function () {
    if (skip.get()) {
      this.skip();
    }
  });
};

const amountVerification = (estimatedAmount: number) => {
  cy.get('.Value__value').contains(estimatedAmount);
};

export const dashboardAssetValuesVerification = (
  estimatedCases: {
    apyType?: string;
    asset: string;
    type: string;
    amount?: number;
    collateralType?: string;
  }[],
  skip: SkipType
) => {
  return describe(`Verification dashboard values`, () => {
    skipSetup(skip);
    it(`Open dashboard page`, () => {
      cy.get('.Menu strong').contains('dashboard').click();
    });
    estimatedCases.forEach((estimatedCase) => {
      describe(`Verification ${estimatedCase.asset} ${estimatedCase.type}, have right values`, () => {
        switch (estimatedCase.type) {
          case constants.dashboardTypes.borrow:
            it(`Check that asset name is ${estimatedCase.asset},
            with apy type ${estimatedCase.apyType}
             ${estimatedCase.amount ? ' and amount ' + estimatedCase.amount : ''}`, () => {
              getDashBoardBorrowRow({
                assetName: estimatedCase.asset,
                apyType: estimatedCase.apyType,
              }).within(($row) => {
                expect($row.find('.TokenIcon__name')).to.contain(estimatedCase.asset);
                expect($row.find('.Switcher__label')).to.contain(estimatedCase.apyType);
                if (estimatedCase.amount) {
                  amountVerification(estimatedCase.amount);
                }
              });
            });
            break;
          case constants.dashboardTypes.deposit:
            it(`Check that asset name is ${estimatedCase.asset},
            with collateral type ${estimatedCase.collateralType}
            ${estimatedCase.amount ? ' and amount ' + estimatedCase.amount : ''}`, () => {
              getDashBoardDepositRow({
                assetName: estimatedCase.asset,
                collateralType: estimatedCase.collateralType,
              }).within(($row) => {
                expect($row.find('.TokenIcon__name')).to.contain(estimatedCase.asset);
                expect($row.find('.Switcher__label')).to.contain(estimatedCase.collateralType);
                if (estimatedCase.amount) {
                  amountVerification(estimatedCase.amount);
                }
              });
            });
            break;
          default:
            break;
        }
      });
    });
  });
};

export const borrowsUnavailable = (skip: SkipType) => {
  return describe('Check that borrows unavailable', () => {
    skipSetup(skip);
    it('Open borrow page', () => {
      cy.get('.Menu strong').contains('Borrow').click();
      cy.get('.TableItem').first().click();
    });
    it('Check blocked message', () => {
      cy.get('.Caption__description').contains(
        'Deposit more collateral or repay part of your borrowings to increase your health factor and be able to borrow.'
      );
    });
  });
};

export const rewardIsNotAvailable = (skip: SkipType) => {
  return describe('Check that reward not available', () => {
    skipSetup(skip);
    it('Check that reward not exist on dashboard page', () => {
      cy.get('.Menu strong').contains('dashboard').click();
      cy.get('body').find(`.IncentiveWrapper`).should('not.exist');
    });
  });
};

export const switchCollateralBlocked = (
  {
    asset,
  }: {
    asset: { shortName: string; fullName: string };
  },
  skip: SkipType
) => {
  let _shortName = asset.shortName;
  return describe('Check that collateral switcher disabled', () => {
    skipSetup(skip);
    it(`Open dashboard page`, () => {
      cy.get('.Menu strong').contains('dashboard').click();
    });
    it(`Check that collateral switcher for ${_shortName} disabled`, () => {
      getDashBoardDepositRow({
        assetName: _shortName,
      })
        .find('.Switcher__swiper input')
        .should('be.disabled');
    });
  });
};

export const switchApyBlocked = (
  {
    asset,
  }: {
    asset: { shortName: string; fullName: string };
  },
  skip: SkipType
) => {
  let _shortName = asset.shortName;
  return describe('Check that apy switcher disabled', () => {
    skipSetup(skip);
    it(`Open dashboard page`, () => {
      cy.get('.Menu strong').contains('dashboard').click();
    });
    it(`Check that APY switcher for ${_shortName} disabled`, () => {
      getDashBoardBorrowRow({
        assetName: _shortName,
      })
        .find('.Switcher__swiper input')
        .should('be.disabled');
    });
  });
};
