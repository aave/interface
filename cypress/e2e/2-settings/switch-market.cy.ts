import markets from '../../fixtures/markets.json';
import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

const switchToTestNet = () => {
  cy.get('#settings-button').click();
  cy.contains('Testnet mode').click();
};

const switchMarket = (name: string, version: string, dataCy: string) => {
  it(`Change the network to ${name}`, () => {
    cy.get('[data-cy="marketSelector"]').click();
    cy.get(`[data-cy="markets_switch_button_${version}"]`).then(($btn) => {
      if (!$btn.attr('aria-passed')) {
        $btn.click();
      }
    });
    cy.get(`[data-cy="${dataCy}"]`).click();
  });
};

const checkNameOfNetwork = (networkName: string) => {
  it(`Check the name of the ${networkName} Market`, () => {
    cy.get('[data-cy="marketSelector"]').contains(networkName);
  });
};

describe.skip('Switching main markets', () => {
  configEnvWithTenderlyMainnetFork({});
  Object.entries(markets.mainnet).forEach(([keyTo, valueTo]) => {
    describe(`Switching market to ${keyTo}`, () => {
      switchMarket(valueTo.name, valueTo.version, valueTo.dataCy);
      checkNameOfNetwork(valueTo.name);
    });
  });
});

describe.skip('Switching testnet markets', () => {
  configEnvWithTenderlyMainnetFork({});
  before(`Turn on testnet mode`, () => {
    switchToTestNet();
  });
  Object.entries(markets.testnet).forEach(([keyTo, valueTo]) => {
    describe(`Switching market to ${keyTo}`, () => {
      switchMarket(valueTo.name, valueTo.version, valueTo.dataCy);
      checkNameOfNetwork(valueTo.name);
    });
  });
});
