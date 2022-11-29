

const getApyRate = (borrowed = false) => {
  cy.doSwitchToDashboardBorrowView();
  return cy
    .get(
      borrowed
        ? `[data-cy="dashboardBorrowedListItem_GHO_Variable"]`
        : `[data-cy="dashboardBorrowListItem_GHO"]`
    )
    .find(`[data-cy="apr"]`)
    .first()
    .then(($btn) => {
      return parseFloat($btn.text());
    });
};
