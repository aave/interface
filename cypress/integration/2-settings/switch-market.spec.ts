import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';
import markets from '../../fixtures/markets.json';

export const changeNetwork = (selector: string) => {
  cy.get('#mui-3').click();
  cy.get(`[data-cy="${selector}"]`).click();
};

export const checkNameOfNetwork = (networkName: string) => {
  it(`step2: Check the name of the ${networkName} Market`, () => {
    cy.get('#mui-3').contains(networkName);
  });
};
export const switchToTestNet = () => {
  cy.get('#settings-button').click();
  cy.contains('Testnet mode').click();
};
export const switchToV2Markets = () => {
  cy.get('#mui-3').click();
  cy.contains('Version 2').click();
  cy.get(`[data-cy="marketSelector_proto_kovan"]`).click();
};
export const switchMarket = (markets) => {
  if (markets.version == 'v2') {
    switchToV2Markets();
  } else {
  }
};

describe('Change markets', () => {
  configEnvWithTenderlyMainnetFork({});
  describe('Switch network', () => {
    it('Switch to testnet', () => {
      switchToTestNet();
    });
  });
  Object.entries(markets).forEach(([keyTo, valueTo]) => {
    describe(`Switching market to ${keyTo}`, () => {
      it(`step1: Change the network to ${valueTo.name}`, () => {
        switchMarket(valueTo);
        changeNetwork(valueTo.dataCy);
      });
      checkNameOfNetwork(valueTo.name);
    });
  });
});
