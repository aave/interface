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

/**
 * This full step to verification any values from Dashboard, for supplied assets and for borrowed assets
 * @example
 *```
 * // Verify ETH supplied asset with amount = 10
 * // type can be 'deposit' or 'borrow'
 * dashboardAssetValuesVerification ([{
 *   type: 'deposit',
 *   assetName: 'ETH',
 *   isCollateral: true
 *   amount: 10
 *  }],
 *  skipTestState,
 *  false
 * )
 * ```
 */
export const dashboardAssetValuesVerification = (
  estimatedCases: {
    type: string;
    assetName: string;
    apyType?: string;
    isCollateral?: boolean;
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
              cy.getDashBoardSuppliedRow(_assetName, estimatedCase.isCollateral).within(($row) => {
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
              // @ts-ignore
              cy.getDashBoardBorrowedRow(_assetName, estimatedCase.apyType).within(($row) => {
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

/**
 * This full step to verification that borrowing unavailable
 * @example borrowsUnavailable(skipTestState)
 */
export const borrowsUnavailable = (skip: SkipType) => {
  return describe('Check that borrowing unavailable', () => {
    skipSetup(skip);
    it('Open Dashboard', () => {
      cy.doSwitchToDashboardBorrowView();
    });
    it('Check that Borrow unavailable', () => {
      cy.get('[data-cy^="dashboardBorrowListItem_"]')
        .first()
        .contains('Borrow')
        .should('be.disabled');
    });
  });
};

/**
 * This full step to verification that borrowing unavailable
 * @example borrowsAvailable(skipTestState)
 */
export const borrowsAvailable = (skip: SkipType) => {
  return describe('Check that borrowing available', () => {
    skipSetup(skip);
    it('Open Dashboard', () => {
      cy.doSwitchToDashboardBorrowView();
    });
    it('Check that Borrow available', () => {
      cy.get('[data-cy^="dashboardBorrowListItem_"]')
        .first()
        .contains('Borrow')
        .should('not.be.disabled');
    });
  });
};

/**
 * This full step to verification that reward on dashboard not available
 * @example rewardIsNotAvailable(skipTestState)
 */
export const rewardIsNotAvailable = (skip: SkipType) => {
  return describe('Check that reward not available', () => {
    skipSetup(skip);
    it('Check that reward not exist on dashboard page', () => {
      cy.doSwitchToDashboardSupplyView();
      cy.get('[data-cy=Claim_Box]').should('not.exist');
    });
  });
};

/**
 * This full step to verification that switch collateral blocked
 * @example switchCollateralBlocked({{ shortName: 'ETH'; fullName: 'Ethereum' }}, skipTestState)
 */
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
      cy.doSwitchToDashboardSupplyView();
      cy.getDashBoardSuppliedRow(_shortName).find('input[type="checkbox"]').should('be.disabled');
    });
  });
};

/**
 * This full step to verification that switch collateral blocked in Modal view
 * @example switchCollateralBlockedInModal({{ shortName: 'ETH'; fullName: 'Ethereum' }, true}, skipTestState)
 */
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
      cy.doSwitchToDashboardSupplyView();
      cy.getDashBoardSuppliedRow(_shortName, isCollateralType)
        .find('input[type="checkbox"]')
        .should('be.enabled')
        .click();
      cy.get('[data-cy=Modal]').find('[data-cy=actionButton]').should('be.disabled');
      cy.get('[data-cy=Modal]').find('[data-cy="CloseModalIcon"]').click();
    });
  });
};

/**
 * This full step to verification that switch apy blocked blocked
 * @example switchApyBlocked({{ shortName: 'ETH'; fullName: 'Ethereum' }, apyType:'Variable'}, skipTestState)
 */
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
      cy.doSwitchToDashboardBorrowView();
    });
    it(`Verify that switching button disabled with APY ${apyType}`, () => {
      cy.getDashBoardBorrowedRow(_shortName, apyType)
        .find(`[data-cy='apyButton_${apyType}']`)
        .should('be.disabled')
        .should('have.text', `${apyType}`);
    });
  });
};

/**
 * This full step to verification that switch apy blocked blocked
 * @example changeBorrowTypeBlocked({{ shortName: 'ETH'; fullName: 'Ethereum' }, isCollateralType: true}, skipTestState)
 */
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
      cy.doSwitchToDashboardSupplyView();
    });
    it('Try to change apy type', () => {
      cy.getDashBoardSuppliedRow(_shortName, isCollateralType)
        .find('.MuiSwitch-input ')
        .should('be.disabled');
    });
  });
};

/**
 * This full step to verification dashboard health factor
 *
 * Could be use one value by 'value' - varibale
 *
 * Could be use range by valueFrom and valueTo
 *
 * @example checkDashboardHealthFactor({value: 10.2, isCollateralType: true}, skipTestState)
 */
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
      cy.doSwitchToDashboardSupplyView();
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
              timeout: 60000,
              interval: 500,
            }
          );
      });
    });
  });
};

/**
 * This full step to verification that e-mode activating disabled
 * @example checkEmodeActivatingDisabled({turnOn: true}, skipTestState)
 */
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
      cy.doSwitchToDashboardBorrowView();
      cy.get('[data-cy=emode-open]').click();
      if (turnOn)
        cy.get(`[data-cy="emode-enable"]`).should('have.class', 'MuiButton-disableElevation');
      else cy.get(`[data-cy="emode-disable"]`).should('have.class', 'MuiButton-disableElevation');
    });
  });
};

/**
 * This full step to verification available to borrow assets, usable with e-mode tests
 * @example verifyCountOfBorrowAssets([{ shortName: 'ETH'; fullName: 'Ethereum' }, { shortName: 'USDC'; fullName: 'Usdc' }], skipTestState)
 */
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
      cy.doSwitchToDashboardBorrowView();
    });
    assets.forEach(($asset) => {
      it(`Verifying that ${$asset.shortName} is exist`, () => {
        cy.get(`[data-cy="dashboardBorrowListItem_${$asset.shortName.toUpperCase()}"]`).should(
          'be.visible'
        );
      });
    });
  });
};
