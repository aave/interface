import assets from '../../fixtures/assets.json';

export class ModalHelpers {
  public static getApyBorrowedRate(tokenName: string, isVariable = true) {
    const typeToken = isVariable ? 'Variable' : 'Stable';
    const _selector = `[data-cy="dashboardBorrowedListItem_${tokenName}_${typeToken}"]`;
    cy.doSwitchToDashboardBorrowView();
    return this.getApyRate(_selector);
  }
}
