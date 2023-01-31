export class ModalHelpers {
  public static setAmount(amount: number, max?: boolean) {
    cy.get('[data-cy=Modal]').find('[data-cy=actionButton]').should('be.visible').should;
    cy.wait(2000); //there is no way to know when real max amount will upload by UI
    if (max) {
      cy.get('[data-cy=Modal]').find('button:contains("Max")').click();
    } else {
      cy.get('[data-cy=Modal] input').first().clear().type(amount.toString());
    }
  }

  public static getApy() {
    return cy
      .get('[data-cy=Modal]')
      .find('[data-cy=apy]')
      .then(($val) => {
        return parseFloat($val.text());
      });
  }
  public static getApyOld() {
    return cy
      .get('[data-cy=Modal]')
      .find('[data-cy=apy]')
      .first()
      .then(($val) => {
        return parseFloat($val.text());
      });
  }
  public static getApyNew() {
    return cy
      .get('[data-cy=Modal]')
      .find('[data-cy=apy]')
      .last()
      .then(($val) => {
        return parseFloat($val.text());
      });
  }
}
