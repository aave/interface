declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    getBySel(value: string): Chainable<Element>;
    // initFork(market: string, tokens?: { address: string }[]): Promise<void>;
  }
}
