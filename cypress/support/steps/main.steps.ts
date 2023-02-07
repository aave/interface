import constants from '../../fixtures/constans.json';

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

/**
 * This full step for supply any available asset from Dashboard view
 * @example
 *```
 * // Supply ETH
 * supply({
 *   asset:{shortName:'ETH', fullName:'Ethereum'},
 *   amount:10,
 *   hasApproval:true
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
export const supply = (
  {
    asset,
    amount,
    hasApproval = true,
    isMaxAmount = false,
  }: {
    asset: { shortName: string; fullName: string };
    amount: number;
    hasApproval: boolean;
    isMaxAmount?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.supply;

  return describe(`Supply process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} supply popup view`, () => {
      cy.doSwitchToDashboardSupplyView();
      cy.get(`[data-cy='dashboardSupplyListItem_${_shortName.toUpperCase()}']`)
        .find('button:contains("Supply")')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Supply ${_shortName}")`).should('be.visible');
    });
    it(`Supply ${isMaxAmount ? 'MAX' : amount} amount for ${_shortName}`, () => {
      cy.setAmount(amount, isMaxAmount);
      cy.doConfirm(hasApproval, _actionName, _shortName);
    });
    doCloseModal();
  });
};

/**
 * This full step for borrow any available asset from Dashboard view
 * @example
 *```
 * // Borrow ETH
 * // apyType options: Variable, Stable, Default
 * borrow({
 *   asset:{shortName:'ETH', fullName:'Ethereum'},
 *   amount:10,
 *   hasApproval:true
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
export const borrow = (
  {
    asset,
    amount,
    apyType,
    hasApproval = true,
    isRisk = false,
    isMaxAmount = false,
  }: {
    asset: { shortName: string; fullName: string };
    amount: number;
    hasApproval: boolean;
    apyType?: string;
    isRisk?: boolean;
    isMaxAmount?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.borrow;

  return describe(`Borrow process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} borrow popup view`, () => {
      cy.doSwitchToDashboardBorrowView();
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
    it(`Borrow ${isMaxAmount ? 'MAX' : amount} amount for ${_shortName}`, () => {
      cy.setAmount(amount, isMaxAmount);
    });
    if (isRisk) {
      it(`Click risk checkbox`, () => {
        cy.get('[data-cy=Modal]').find(`[data-cy="risk-checkbox"]`).click();
      });
    }
    it(`Confirmation process`, () => {
      cy.doConfirm(hasApproval, _actionName, _shortName);
    });
    doCloseModal();
  });
};

/**
 * This full step for repay one asset by another asset
 * @example
 *```
 * // Repay ETH by USDC
 * // apyType options: Variable, Stable, Default
 * // repayOption options: collateral, wallet, default
 * repay({
 *   asset:{shortName:'ETH', fullName:'Ethereum'},
 *   apyType:'Variable',
 *   amount:10,
 *   repayOption:'collateral',
 *   hasApproval:true,
 *   repayableAsset:{shortName:'USDC'}
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
export const repay = (
  {
    asset,
    apyType,
    amount,
    repayOption,
    hasApproval = false,
    repayableAsset,
    assetForCollateralRepay,
    isMaxAmount = false,
  }: {
    asset: { shortName: string; fullName: string };
    apyType: string;
    amount: number;
    repayOption: string;
    hasApproval: boolean;
    repayableAsset?: { shortName: string };
    assetForCollateralRepay?: { shortName: string };
    isMaxAmount?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.repay;

  return describe(`Repay by ${repayOption} process for ${_shortName} by
  ${
    repayOption == constants.repayType.collateral
      ? assetForCollateralRepay
        ? assetForCollateralRepay.shortName
        : 'default asset'
      : repayableAsset
      ? repayableAsset.shortName
      : _shortName
  }`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} repay popup view`, () => {
      cy.doSwitchToDashboardBorrowView();
      cy.getDashBoardBorrowedRow(_shortName, apyType).find(`button:contains("Repay")`).click();
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
        cy.get('[data-cy=Modal]').as('Modal');
        cy.get('@Modal').get('[data-cy=assetSelect]').click();
        cy.get('@Modal')
          .get(`[data-cy='assetsSelectOption_${repayableAsset.shortName.toUpperCase()}']`)
          .click();
        cy.get('@Modal').get('[data-cy=assetSelect]').contains(repayableAsset.shortName);
      });
    }
    it(`Repay ${
      isMaxAmount ? 'MAX' : amount
    } amount for ${_shortName}, with ${repayOption} repay option`, () => {
      cy.setAmount(amount, isMaxAmount);
      if (repayOption == constants.repayType.collateral) {
        cy.get('[data-cy=Modal]')
          .find('[data-cy=approveButtonChange]')
          .click()
          .get('[data-cy=approveOption_Transaction]')
          .click();
      }
      cy.doConfirm(hasApproval, _actionName, _shortName);
    });
    doCloseModal();
  });
};

/**
 * This full step for withdraw any availble assets
 * @example
 *```
 * // Withdraw ETH
 * // apyType options: Variable, Stable, Default
 * withdraw({
 *   asset:{shortName:'ETH', fullName:'Ethereum'},
 *   isCollateral:true,
 *   amount: 10,
 *   hasApproval:true
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
export const withdraw = (
  {
    asset,
    isCollateral,
    amount,
    hasApproval = false,
    forWrapped = false,
    isRisk = false,
    isMaxAmount = false,
  }: {
    asset: { shortName: string; fullName: string };
    isCollateral: boolean;
    amount: number;
    hasApproval: boolean;
    forWrapped?: boolean;
    isRisk?: boolean;
    isMaxAmount?: boolean;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  const _shortName = asset.shortName;
  const _actionName = constants.actionTypes.withdraw;

  return describe(`Withdraw process for ${_shortName}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open ${_shortName} Withdraw popup view`, () => {
      cy.doSwitchToDashboardSupplyView();
      cy.getDashBoardSuppliedRow(_shortName, isCollateral)
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
    it(`Withdraw ${isMaxAmount ? 'MAX' : amount} amount for ${_shortName}`, () => {
      if (isMaxAmount) cy.wait(2000);
      cy.setAmount(amount, isMaxAmount);
    });
    if (isRisk) {
      it(`Click risk checkbox`, () => {
        cy.get('[data-cy=Modal]').find(`[data-cy="risk-checkbox"]`).click();
      });
    }
    it(`Confirmation process`, () => {
      cy.doConfirm(hasApproval, _actionName, forWrapped ? 'W' + _shortName : _shortName);
    });
    doCloseModal();
  });
};

/**
 * This full step to change borrow apy from Dashboard view
 * @example
 *```
 * // Change borrow type for ETH from Stable to Variable
 * // apyType options: Variable, Stable
 * changeBorrowType({
 *   asset:{shortName:'ETH', fullName:'Ethereum'},
 *   apyType:'Stable',
 *   newAPY:'Variable',
 *   hasApproval:true
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
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
      cy.doSwitchToDashboardBorrowView();
      cy.getDashBoardBorrowedRow(_shortName, apyType)
        .find(`[data-cy="apyButton_${apyType}"]`)
        .click();
    });
    it(`Change the ${_shortName} borrowing apr type from ${apyType} to ${newAPY}`, () => {
      cy.get(`[data-cy="apyMenu_${apyType}"]`).contains(`APY, ${newAPY.toLowerCase()}`).click();
    });
    it(`Make approve for ${_shortName}, on confirmation page`, () => {
      cy.doConfirm(hasApproval, _actionName);
    });
    doCloseModal();
  });
};

/**
 * This full step to swap assets from Dashboard view
 * @example
 *```
 * // Swap from ETH to USDC
 * // apyType options: Variable, Stable
 * swap({
 *   fromAsset:{shortName:'ETH', fullName:'Ethereum'},
 *   toAsset:{shortName:'USDC', fullName:'USDC'},
 *   isCollateralFromAsset: false,
 *   amount: 1.137,
 *   hasApproval: true
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
export const swap = (
  {
    fromAsset,
    toAsset,
    isCollateralFromAsset,
    amount,
    hasApproval = true,
    isMaxAmount = false,
  }: {
    fromAsset: { shortName: string; fullName: string };
    toAsset: { shortName: string; fullName: string };
    isCollateralFromAsset: boolean;
    amount: number;
    hasApproval: boolean;
    isMaxAmount?: boolean;
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
      cy.doSwitchToDashboardSupplyView();
      cy.getDashBoardSuppliedRow(_shortNameFrom, isCollateralFromAsset)
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
    it(`Make approve for ${isMaxAmount ? 'MAX' : amount} amount`, () => {
      cy.setAmount(amount, isMaxAmount);
      cy.get('[data-cy=Modal]')
        .find('[data-cy=approveButtonChange]')
        .click()
        .get('[data-cy=approveOption_Transaction]')
        .click();
      cy.wait(2000);
      cy.doConfirm(hasApproval, _actionName);
    });
    doCloseModal();
  });
};

/**
 * This full step to change collateral for any assets from Dashboard view with positive result
 * @example
 *```
 * // Change collateral status for ETH
 * changeCollateral ({
 *   asset:{shortName:'ETH', fullName:'Ethereum'},
 *   isCollateralFromAsset: false,
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
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
      cy.doSwitchToDashboardSupplyView();
    });
    it('Open Switch type Modal', () => {
      cy.getDashBoardSuppliedRow(_shortName, isCollateralType).find('.MuiSwitch-input ').click();
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

/**
 * This full step to claim reward  from Dashboard
 * @example
 *```
 * // Claim reward of Matic
 * claimReward ({
 *   asset:{shortName:'MATIC', fullName:'Matic'},
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
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
      cy.doSwitchToDashboardSupplyView();
    });
    it(`Open claim modal`, () => {
      cy.get('[data-cy=Claim_Box]').should('be.visible');
      cy.get('[data-cy=Dashboard_Claim_Button]').click();
    });
    it('Confirm claim', () => {
      cy.doConfirm(true, 'Claim', asset.shortName);
    });
    doCloseModal();
  });
};

/**
 * This full step to change collateral with negative result from Dashboard
 * @example
 *```
 * // Change collateral have to blocked for Matic
 * changeCollateralNegative ({
 *   asset:{shortName:'MATIC', fullName:'Matic'},
 *   isCollateralType
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
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
      cy.doSwitchToDashboardSupplyView();
      cy.getDashBoardSuppliedRow(_shortName, isCollateralType).find('.MuiSwitch-input ').click();
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

/**
 * This full step to activate emode from Dashboard
 * @example
 *```
 * // Turn on e-mode
 * emodeActivating ({
 *   turnOn: true
 *  },
 *  skipTestState,
 *  false
 * )
 * ```
 */
export const emodeActivating = (
  {
    turnOn,
    multipleEmodes,
    emodeOption,
  }: {
    turnOn: boolean;
    multipleEmodes?: boolean;
    emodeOption?: string;
    emodeName?: string;
  },
  skip: SkipType,
  updateSkipStatus = false
) => {
  return describe(`${turnOn ? 'Turn on E-mode' : 'Turn off E-mode'}`, () => {
    skipSetup({ skip, updateSkipStatus });
    it(`Open e-mode switcher`, () => {
      cy.doSwitchToDashboardBorrowView();
      cy.get('[data-cy=emode-open]').click();
    });
    if (turnOn) {
      it(`Turn on e-mode`, () => {
        cy.doSwitchToDashboardBorrowView();
        cy.get(`[data-cy="emode-enable"]`).click();
      });
    } else {
      it(`Turn off e-mode`, () => {
        cy.doSwitchToDashboardBorrowView();
        cy.get(`[data-cy="emode-disable"]`).click();
      });
    }
    if (multipleEmodes && turnOn && emodeOption) {
      it(`Chose "${emodeOption}" option`, () => {
        cy.get(`[data-cy="EmodeSelect"]`).click();
        cy.get(`[role="presentation"]`)
          .find(`ul[role="listbox"]`)
          .contains(`${emodeOption}`)
          .click();
      });
    }
    it(`Sign ${turnOn ? 'Turn on E-mode' : 'Turn off E-mode'}`, () => {
      const actionName = turnOn ? 'Enable E-Mode' : 'Disable E-Mode';
      cy.doConfirm(true, actionName);
    });
    doCloseModal();
    it(`Check that E-mode was ${turnOn ? 'on' : 'off'}`, () => {
      cy.get(`[data-cy="emode-open"]`).should(
        'have.text',
        turnOn ? `${emodeOption ? emodeOption : 'Stablecoins'}` : 'Disabled'
      );
    });
  });
};

/**
 * This step to close any modal
 */
export const doCloseModal = () => {
  return it(`Close modal popup`, () => {
    cy.get('[data-cy=CloseModalIcon]').should('not.be.disabled').click();
    cy.get('[data-cy=Modal]').should('not.exist');
  });
};
