type SetAmount = {
  amount: number;
  hasApproval: boolean;
  max?: boolean;
};

export const setAmount = ({ amount, hasApproval, max }: SetAmount) => {
  cy.get('[data-cy=Modal]').find('button:contains("Enter an amount")').should('be.disabled');
  if (max) {
    cy.get('[data-cy=Modal]').find('button:contains("Max")').click();
  } else {
    cy.get('[data-cy=Modal] input').first().type(amount.toString());
  }
  if (hasApproval) {
    cy.get(`[data-cy=Modal] [data-cy=actionButton]`).as('button');
    cy.get('@button').should('not.be.disabled');
  } else {
    cy.get(`[data-cy=Modal] [data-cy=approvalButton]`).as('button');
    cy.get('@button').should('not.be.disabled');
  }
};

type ConfirmAction = {
  hasApproval: boolean;
  actionName?: string;
  assetName?: string;
  isWrapped?: boolean;
};

export const doConfirm = ({
  hasApproval,
  actionName,
  assetName,
  isWrapped = false,
}: ConfirmAction) => {
  if (isWrapped) assetName = 'W' + assetName;
  cy.log(`${hasApproval ? 'One step process' : 'Two step process'}`);
  if (!hasApproval) {
    cy.get(`[data-cy=approvalButton]`).should('not.be.disabled').wait(3000).click();
  }
  // cy.get(`[data-cy=actionButton]`).as('button');
  cy.get('[data-cy=actionButton]', { timeout: 10000 })
    .should('not.be.disabled')
    .then(($btn) => {
      if (assetName && actionName) {
        // expect($btn.first()).to.contain(`${actionName} ${assetName}`);
      }
      if (assetName && !actionName) {
        // expect($btn.first()).to.contain(`${actionName}`);
      }
    })
    .wait(3000)
    .click();
  cy.get("[data-cy=Modal] h2:contains('All done!')").should('be.visible');
};

export const doCloseModal = () => {
  return it(`Close modal popup`, () => {
    cy.get('[data-cy=closeButton]').should('not.be.disabled').click();
    cy.get('[data-cy=Modal]').should('not.exist');
  });
};

function doChooseSwapToOption(assetName: string) {
  cy.get('.AssetSelect__reverse .AssetSelect__button').click();
  cy.get('.AssetSelect__reverse .TokenIcon__name').contains(assetName).click();
}

type SwapForRepayAction = {
  amount: number;
  assetName?: string;
};

export const doSwapForRepay = ({ amount, assetName }: SwapForRepayAction) => {
  cy.log('assetName,' + assetName);
  cy.get(':nth-child(1) > .AmountFieldWithSelect__field-inner  [data-cy=amountInput]').type(
    amount.toString(),
    { delay: 0 }
  );
  if (assetName) {
    doChooseSwapToOption(assetName);
  }
  cy.get('.Button').contains('Continue').parents('.Button').should('not.be.disabled').click();
};

type GetDashBoardBorrowRow = {
  assetName: string;
  apyType: string;
};

export const getDashBoardBorrowRow = ({ assetName, apyType }: GetDashBoardBorrowRow) => {
  return cy
    .get(`[data-cy='dashboardBorrowedListItem_${assetName.toUpperCase()}_${apyType}']`)
    .first();
};

type GetDashBoardDepositRow = {
  assetName: string;
  isCollateralType?: boolean;
};

export const getDashBoardDepositRow = ({ assetName, isCollateralType }: GetDashBoardDepositRow) => {
  if (isCollateralType) {
    return cy
      .get(`[data-cy='dashboardSuppliedListItem_${assetName.toUpperCase()}_Collateral']`)
      .first();
  } else {
    return cy.get(`[data-cy='dashboardSuppliedListItem_${assetName.toUpperCase()}_NoCollateral']`);
  }
};

export const doSwitchToDashboardBorrowView = () => {
  cy.get('[role=group]')
    .contains('Borrow')
    .then(($btn) => {
      if (!$btn.is('disabled')) {
        $btn.click();
      }
    });
  cy.get(`*:contains("Your borrows")`).should('be.visible');
};

export const doSwitchToDashboardSupplyView = () => {
  cy.get('[role=group]')
    .contains('Supply')
    .then(($btn) => {
      if (!$btn.is('disabled')) {
        $btn.click();
      }
    });
  cy.get(`*:contains("Your supplies")`).should('be.visible');
};
