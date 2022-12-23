import assets from '../../fixtures/assets.json';

export class DashboardHelpers {
  public static getApyBorrowedRate(tokenName: string, isVariable = true) {
    const typeToken = isVariable ? 'Variable' : 'Stable';
    const _selector = `[data-cy="dashboardBorrowedListItem_${tokenName}_${typeToken}"]`;
    cy.doSwitchToDashboardBorrowView();
    return this.getApyRate(_selector);
  }

  public static getApyBorrowRate(tokenName: string) {
    const _selector = `[data-cy="dashboardBorrowListItem_${tokenName}"]`;
    cy.doSwitchToDashboardBorrowView();
    return this.getApyRate(_selector);
  }

  public static getApySupplyRate(tokenName: string) {
    const _selector = `[data-cy='dashboardSupplyListItem_${tokenName}']`;
    cy.doSwitchToDashboardSupplyView();
    return this.getApyRate(_selector);
  }

  private static getApyRate(selector: string) {
    return cy
      .get(selector)
      .find(`[data-cy="apr"]`)
      .first()
      .then(($val) => {
        return parseFloat($val.text());
      });
  }

  public static waitLoadingGHODashboard = (value?: number) => {
    cy.waitUntil(
      () => {
        let res = false;
        return DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
          if (!isNaN($val)) res = true;
          if (value) {
            if ($val == value) res = true;
            else res = false;
          } else {
            if (!isNaN($val)) res = true;
          }
          return res;
        });
        // let res = false;
        // return DashboardHelpers.getApyBorrowRate(assets.ghoV3Market.GHO.shortName).then(($val) => {
        //   if (!isNaN($val)) res = true;
        //   return res;
        // });
      },
      {
        timeout: 30000,
        interval: 500,
      }
    );
  };
}
