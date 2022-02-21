/// <reference types="cypress" />
import {
  doSwitchToDashboardBorrowView,
  doSwitchToDashboardSupplyView,
  getDashBoardBorrowRow,
  getDashBoardDepositRow
} from "./actions.steps";
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
    assetName: string;
    wrapped: boolean;
    isCollateral?: boolean;
    type: string;
    amount?: number;
    collateralType?: string;
  }[],
  skip: SkipType
) => {
  return describe(`Verification dashboard values`, () => {
    skipSetup(skip);
    it(`Open dashboard page`, () => {
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').wait(3000).click();
    });
    estimatedCases.forEach((estimatedCase) => {
      describe(`Verification ${estimatedCase.assetName} ${estimatedCase.type}, have right values`, () => {
        switch (estimatedCase.type) {
          case constants.dashboardTypes.deposit:
            it(`Check that asset name is ${estimatedCase.assetName},
            with collateral type ${estimatedCase.collateralType}
            ${estimatedCase.amount ? ' and amount ' + estimatedCase.amount : ''}`, () => {
              cy.get(`[data-cy=dashboardSuppliedListItem_${estimatedCase.wrapped?'W':''}${estimatedCase.assetName}_${estimatedCase.isCollateral?"Collateral":"NoCollateral"}]`)
                .within(($row) =>{
                expect($row.find(`[data-cy="assetName"]`)).to.contain(estimatedCase.assetName);
                if(estimatedCase.isCollateral){
                  expect($row.find('.MuiSwitch-input')).to.have.attr("checked");
                }else{
                  expect($row.find('.MuiSwitch-input')).to.not.have.attr("checked");
                }
                if (estimatedCase.amount) {
                  const _text = $row.find('[data-cy=nativeAmount]').text() as string;
                  expect(_text).to.include(estimatedCase.amount.toString());
                }
              });
            });
            break;
          case constants.dashboardTypes.borrow:
            it(`Check that asset name is ${estimatedCase.assetName},
            with apy type ${estimatedCase.apyType}
            ${estimatedCase.amount ? ' and amount ' + estimatedCase.amount : ''}`, () => {
              cy.get(`[data-cy=dashboardBorrowedListItem_${estimatedCase.wrapped?'W':''}${estimatedCase.assetName}_${estimatedCase.apyType}]`)
                .within(($row) =>{
                expect($row.find(`[data-cy="assetName"]`)).to.contain(estimatedCase.assetName);
                expect($row.find(`[data-cy="apyButton"]`)).to.contain(estimatedCase.apyType);
                if (estimatedCase.amount) {
                  const _text = $row.find('[data-cy=nativeAmount]').text() as string;
                  expect(_text).to.include(estimatedCase.amount.toString());
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
  return describe('Check that borrowing unavailable', () => {
    skipSetup(skip);
    it('Open Dashboard', () => {
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardBorrowView();
    });
    it('Check blocked message', () => {
      cy.get('[data-cy^="dashboardBorrowListItem_"]')
        .first()
        .contains("Borrow")
        .should("be.disabled");
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

export const changeBorrowTypeBlocked = (
  {
    asset,
    isCollateralType,
  }: {
    asset: { shortName: string; fullName: string };
    isCollateralType: boolean;
  },
  skip: SkipType,
) => {
  const _shortName = asset.shortName;

  return describe(`Verify that Switch borrow is unavailable`, () => {
    skipSetup(skip);
    it('Open dashboard page', () => {
      cy.get('[data-cy=menuDashboard]').find('a:contains("Dashboard")').click();
      doSwitchToDashboardSupplyView();
    });
    it('Try to change apy type', () => {
      getDashBoardDepositRow({ assetName: _shortName, isCollateralType })
        .find('.MuiSwitch-input ')
        .should('be.disabled');
    });
  });
};