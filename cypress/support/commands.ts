declare global {
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Chainable {
      /**
       * This will set amount in Modal
       * @param amount number
       * @param max boolean optional
       * @example cy.setAmount('137')
       */
      setAmount(amount: number, max?: boolean): void
      doConfirm(hasApproval:boolean, actionName?:string, assetName?:string):void
    }
  }
}

Cypress.Commands.add('setAmount', (amount:number, max?:boolean) => {
  cy.get('[data-cy=Modal]').find('button:contains("Enter an amount")').should('be.disabled');
  if (max) {
    cy.get('[data-cy=Modal]').find('button:contains("Max")').click();
  } else {
    cy.get('[data-cy=Modal] input').first().type(amount.toString());
  }
})

Cypress.Commands.add('doConfirm', (hasApproval:boolean, actionName?:string, assetName?:string) => {
  cy.log(`${hasApproval ? 'One step process' : 'Two step process'}`)
  if (!hasApproval) {
    cy.get(`[data-cy=approvalButton]`, { timeout: 20000 })
      .should('not.be.disabled')
      // .wait(1000)
      .click();
  }
  cy.get('[data-cy=actionButton]', { timeout: 30000 })
    .should('not.be.disabled')
    .then(($btn) => {
      if (assetName && actionName) {
        expect($btn.first()).to.contain(`${actionName} ${assetName}`);
      }
      if (assetName && !actionName) {
        expect($btn.first()).to.contain(`${actionName}`);
      }
    })
    // .wait(3000)
    .click();
  cy.get("[data-cy=Modal] h2:contains('All done!')").should('be.visible');
})



export {};
