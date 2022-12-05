import constants from '../../fixtures/constans.json';

export class DashboardActions {
  public static borrow({
    asset,
    amount,
    hasApproval = true,
    apyType,
    isRisk = false,
    isMaxAmount = false,
  }: {
    asset: { shortName: string; fullName: string };
    amount: number;
    hasApproval: boolean;
    apyType?: string;
    isRisk?: boolean;
    isMaxAmount?: boolean;
  }) {
    const _actionName = constants.actionTypes.borrow;
    return it(`Borrow ${amount} ${asset.shortName}`, () => {
      cy.doSwitchToDashboardBorrowView();
      cy.get(`[data-cy='dashboardBorrowListItem_${asset.shortName.toUpperCase()}']`)
        .contains('Borrow')
        .should('not.be.disabled')
        .click();
      cy.get(`[data-cy=Modal] h2:contains("Borrow ${asset.shortName}")`).should('be.visible');
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
      cy.setAmount(amount, isMaxAmount);
      if (isRisk) {
        cy.get('[data-cy=Modal]').find(`[data-cy="risk-checkbox"]`).click();
      }
      cy.doConfirm(hasApproval, _actionName, asset.shortName);
      cy.get('[data-cy=CloseModalIcon]').should('not.be.disabled').click();
      cy.get('[data-cy=Modal]').should('not.exist');
    });
  }
}
