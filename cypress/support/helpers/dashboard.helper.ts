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

  public static getGhoApyBorrowRangeMin(tokenName: string) {
    const _selector = `[data-cy="dashboardBorrowListItem_${tokenName}"]`;
    cy.doSwitchToDashboardBorrowView();
    return this.getApyGhoRangeMin(_selector);
  }

  public static getGhoApyBorrowRangeMax(tokenName: string) {
    const _selector = `[data-cy="dashboardBorrowListItem_${tokenName}"]`;
    cy.doSwitchToDashboardBorrowView();
    return this.getApyGhoRangeMax(_selector);
  }

  public static getApySupplyRate(tokenName: string) {
    const _selector = `[data-cy='dashboardSupplyListItem_${tokenName}']`;
    cy.doSwitchToDashboardSupplyView();
    return this.getApyRate(_selector);
  }

  public static getBorrowedAmount(tokenName: string) {
    const _selector = `[data-cy^='dashboardBorrowedListItem_${tokenName}']`;
    return cy
      .get(_selector)
      .find(`[data-cy="nativeAmount"]`)
      .first()
      .then(($val) => {
        return parseFloat($val.text());
      });
  }

  private static getApyRate(selector: string) {
    return cy
      .get(selector)
      .find(`[data-cy="apy"]`)
      .first()
      .then(($val) => {
        return parseFloat($val.text());
      });
  }

  private static getApyGhoRangeMin(selector: string) {
    return cy
      .get(selector)
      .find(`[data-cy="apy-gho-from"]`)
      .first()
      .then(($val) => {
        return parseFloat($val.text());
      });
  }

  private static getApyGhoRangeMax(selector: string) {
    return cy
      .get(selector)
      .find(`[data-cy="apy-gho-till"]`)
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
          if (!isNaN($val) && $val !== 0) res = true;
          if (value) {
            if ($val == value && $val !== 0) res = true;
            else res = false;
          } else {
            if (!isNaN($val) && $val !== 0) res = true;
          }
          return res;
        });
      },
      {
        timeout: 30000,
        interval: 500,
      }
    );
  };

  public static waitLoadingGHODashboardRange = () => {
    cy.waitUntil(
      () => {
        let res = false;
        return DashboardHelpers.getGhoApyBorrowRangeMin(assets.ghoV3Market.GHO.shortName).then(
          ($val) => {
            if (!isNaN($val) && $val !== 0) res = true;
            return res;
          }
        );
      },
      {
        timeout: 30000,
        interval: 500,
      }
    );
  };

  public static waitLoadingGHOBorrowedAmount = () => {
    cy.waitUntil(
      () => {
        let res = false;
        return DashboardHelpers.getBorrowedAmount(assets.ghoV3Market.GHO.shortName).then(($val) => {
          if (!isNaN($val) && $val !== 0) res = true;
          return res;
        });
      },
      {
        timeout: 30000,
        interval: 500,
      }
    );
  };

  public static openBorrowModal(assetName: string) {
    cy.get(`[data-cy='dashboardBorrowListItem_${assetName.toUpperCase()}']`)
      .contains('Borrow')
      .should('not.be.disabled')
      .click();
    cy.get(`[data-cy=Modal] h2:contains("Borrow ${assetName}")`).should('be.visible');
  }
}
