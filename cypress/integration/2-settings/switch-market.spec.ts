import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';
import markets from '../../fixtures/markets.json';

export const changeNetwork = (selector: string) => {
  cy.get('#mui-2').click();
  cy.get(`[data-cy="${selector}"]`).click();
};

export const checkNameOfNetwork = (networkName: string) => {
  it(`step2: Check the name of the ${networkName} Market`, () => {
    cy.get('#mui-2').contains(networkName);
  });
};

describe('Change markets', () => {
  configEnvWithTenderlyMainnetFork({});
  Object.entries(markets).forEach(([keyTo, valueTo]) => {
    describe(`Switching market to ${keyTo}`, () => {
      it(`step1: Change the network to ${valueTo.name}`, () => {
        changeNetwork(valueTo.dataCy);
      });
      checkNameOfNetwork(valueTo.name);
    });
  });
});
