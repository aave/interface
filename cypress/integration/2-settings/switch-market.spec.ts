import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';
import marketsV2 from '../../fixtures/marketsV2.json';
import marketsV3 from '../../fixtures/marketsV3.json';

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
export const switchToV3Markets = () => {
  cy.get('#mui-3').click();
  cy.contains('Version 3').click();
  cy.get(`[data-cy="marketSelector_proto_eth_rinkeby_v3"]`).click();
};

describe('Change markets', () => {
  configEnvWithTenderlyMainnetFork({});
  describe('Switch network', () => {
    it('Switch to testnet', () => {
      switchToTestNet();
    });
  });
  Object.entries(marketsV2).forEach(([keyTo, valueTo]) => {
    describe(`Switching market to ${keyTo}`, () => {
      it(`step1: Change the network to ${valueTo.name}`, () => {
        changeNetwork(valueTo.dataCy);
      });
      checkNameOfNetwork(valueTo.name);
    });
  });
  describe('Switch to V3 markets', () => {
    it('Switch from V2 to V3 market', () => {
      switchToV3Markets();
    });
  });
  Object.entries(marketsV3).forEach(([keyTo, valueTo]) => {
    describe(`Switch V3 market to ${keyTo}`, () => {
      it(`step2: Change network to ${valueTo.name} V3`, () => {
        changeNetwork(valueTo.dataCy);
      });
      checkNameOfNetwork(valueTo.name);
    });
  });
});
