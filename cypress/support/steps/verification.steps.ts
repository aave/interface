/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />
import {
  doSwitchToDashboardBorrowView,
  doSwitchToDashboardSupplyView,
  getDashBoardBorrowRow,
  getDashBoardDepositRow,
} from './actions.steps';
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

export const dashboardAssetValuesVerification = (
  estimatedCases: {
    apyType?: string;
    assetName: string;
    isCollateral?: boolean;
    type: string;
    amount?: number;
    collateralType?: string;
  }[],
  skip: SkipType
) => {
  return describe(`Verification dashboard values`, () => {
    skipSetup(skip);
    estimatedCases.forEach((estimatedCase) => {
      describe(`Verification ${estimatedCase.assetName} ${estimatedCase.type}, have right values`, () => {
        const _assetName: string = estimatedCase.assetName;
        switch (estimatedCase.type) {
          case constants.dashboardTypes.deposit:
            it(`Check that asset name is ${estimatedCase.assetName},
            with collateral type ${estimatedCase.collateralType}
            ${estimatedCase.amount ? ' and amount ' + estimatedCase.amount : ''}`, () => {
              getDashBoardDepositRow({
                assetName: _assetName,
                isCollateralType: estimatedCase.isCollateral,
              }).within(($row) => {
                expect($row.find(`[data-cy="assetName"]`)).to.contain(estimatedCase.assetName);
                if (estimatedCase.isCollateral) {
                  expect($row.find('.MuiSwitch-input')).to.have.attr('checked');
                } else {
                  expect($row.find('.MuiSwitch-input')).to.not.have.attr('checked');
                }
                if (estimatedCase.amount) {
                  cy.get('[data-cy=nativeAmount]').contains(estimatedCase.amount.toString());
                }
              });
            });
            break;
          case constants.dashboardTypes.borrow:
            it(`Check that asset name is ${estimatedCase.assetName},
            with apy type ${estimatedCase.apyType}
            ${estimatedCase.amount ? ' and amount ' + estimatedCase.amount : ''}`, () => {
              getDashBoardBorrowRow({
                assetName: _assetName,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                apyType: estimatedCase.apyType,
              }).within(($row) => {
                expect($row.find(`[data-cy="assetName"]`)).to.contain(estimatedCase.assetName);
                expect($row.find(`[data-cy="apyButton_${estimatedCase.apyType}"]`)).to.exist;
                if (estimatedCase.amount) {
                  cy.get('[data-cy=nativeAmount]').contains(estimatedCase.amount.toString());
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
      doSwitchToDashboardBorrowView();
    });
    it('Check that Borrow unavailable', () => {
      cy.get('[data-cy^="dashboardBorrowListItem_"]')
        .first()
        .contains('Borrow')
        .should('be.disabled');
    });
  });
};

export const borrowsAvailable = (skip: SkipType) => {
  return describe('Check that borrowing available', () => {
    skipSetup(skip);
    it('Open Dashboard', () => {
      doSwitchToDashboardBorrowView();
    });
    it('Check that Borrow available', () => {
      cy.get('[data-cy^="dashboardBorrowListItem_"]')
        .first()
        .contains('Borrow')
        .should('not.be.disabled');
    });
  });
};

export const rewardIsNotAvailable = (skip: SkipType) => {
  return describe('Check that reward not available', () => {
    skipSetup(skip);
    it('Check that reward not exist on dashboard page', () => {
      doSwitchToDashboardSupplyView();
      cy.get('[data-cy=Claim_Box]').should('not.exist');
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
  const _shortName = asset.shortName;
  return describe('Check that collateral switcher disabled', () => {
    skipSetup(skip);
    it(`Check that collateral switcher for ${_shortName} disabled`, () => {
      doSwitchToDashboardSupplyView();
      getDashBoardDepositRow({
        assetName: _shortName,
      })
        .find('input[type="checkbox"]')
        .should('be.disabled');
    });
  });
};

export const switchCollateralBlockedInModal = (
  {
    asset,
    isCollateralType,
  }: {
    asset: { shortName: string; fullName: string };
    isCollateralType: boolean;
  },
  skip: SkipType
) => {
  const _shortName = asset.shortName;
  return describe('Check that collateral switcher disabled', () => {
    skipSetup(skip);
    it(`Check that collateral switching blocked in popup`, () => {
      doSwitchToDashboardSupplyView();
      getDashBoardDepositRow({
        assetName: _shortName,
        isCollateralType,
      })
        .find('input[type="checkbox"]')
        .should('be.enabled')
        .click();
      cy.get('[data-cy=Modal]').find('[data-cy=actionButton]').should('be.disabled');
      cy.get('[data-cy=Modal]').find('[data-cy="CloseModalIcon"]').click();
    });
  });
};

export const switchApyBlocked = (
  {
    asset,
    apyType,
  }: {
    asset: { shortName: string; fullName: string };
    apyType: string;
  },
  skip: SkipType
) => {
  const _shortName = asset.shortName;
  return describe('Check that apy switcher disabled', () => {
    skipSetup(skip);
    it(`Open dashboard`, () => {
      doSwitchToDashboardBorrowView();
    });
    it(`Verify that switching button disabled with APY ${apyType}`, () => {
      getDashBoardBorrowRow({ assetName: _shortName, apyType })
        .find(`[data-cy='apyButton_${apyType}']`)
        .should('be.disabled')
        .should('have.text', `${apyType}`);
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
  skip: SkipType
) => {
  const _shortName = asset.shortName;

  return describe(`Verify that Switch borrow is unavailable`, () => {
    skipSetup(skip);
    it('Open dashboard page', () => {
      doSwitchToDashboardSupplyView();
    });
    it('Try to change apy type', () => {
      getDashBoardDepositRow({ assetName: _shortName, isCollateralType })
        .find('.MuiSwitch-input ')
        .should('be.disabled');
    });
  });
};

export const checkDashboardHealthFactor = (
  {
    value,
    valueFrom,
    valueTo,
  }: {
    value?: number;
    valueFrom?: number;
    valueTo?: number;
  },
  skip: SkipType
) => {
  return describe(`Check that health factor ${
    value ? 'is ' + value : 'in range from ' + valueFrom + ' till ' + valueTo
  }`, () => {
    skipSetup(skip);
    it('Open dashboard page', () => {
      doSwitchToDashboardSupplyView();
    });
    it('Check value', () => {
      cy.get(`[data-cy=HealthFactorTopPannel]`).then(($health) => {
        if (valueFrom && valueTo)
          cy.waitUntil(
            () => parseFloat($health.text()) >= valueFrom && parseFloat($health.text()) <= valueTo,
            {
              errorMsg:
                parseFloat($health.text()) +
                ' value not in range from ' +
                valueFrom +
                ' till ' +
                valueTo,
              timeout: 20000,
              interval: 500,
            }
          );
      });
    });
  });
};

export const checkEmodeActivatingDisabled = (
  {
    turnOn,
  }: {
    turnOn: boolean;
  },
  skip: SkipType
) => {
  return describe(`${turnOn ? 'Turn on E-mode' : 'Turn off E-mode'}`, () => {
    skipSetup(skip);
    it('Open E-mode switcher modal', () => {
      doSwitchToDashboardBorrowView();
      cy.get('[data-cy=emode-open]').click();
      if (turnOn)
        cy.get(`[data-cy="emode-enable"]`).should('have.class', 'MuiButton-disableElevation');
      else cy.get(`[data-cy="emode-disable"]`).should('have.class', 'MuiButton-disableElevation');
    });
  });
};

export const verifyCountOfBorrowAssets = (
  {
    assets,
  }: {
    assets: { shortName: string; fullName: string }[];
  },
  skip: SkipType
) => {
  return describe(`Verify that count available borrowed assets is ${assets.length}`, () => {
    skipSetup(skip);
    it(`Open Borrow dashboard part`, () => {
      doSwitchToDashboardBorrowView();
    });
    assets.forEach(($asset) => {
      it(`Verifying that ${$asset.shortName} is exist`, () => {
        cy.get(`[data-cy="dashboardBorrowListItem_${$asset.shortName.toUpperCase()}"]`).should(
          'be.visible'
        );
      });
    });
    it('Verifying length', () => {
      doSwitchToDashboardBorrowView();
      cy.get('[data-cy*=dashboardBorrowListItem_]').should('have.length', assets.length);
    });
  });
};
