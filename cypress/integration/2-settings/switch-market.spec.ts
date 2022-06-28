import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

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
  describe('CASE1:Switching markets', () => {
    configEnvWithTenderlyMainnetFork({});
    it('step1: Change the network from ETH fork to the Avalanche', () => {
      changeNetwork('marketSelector_proto_avalanche');
    });

    it('step2:Check the name of the Market', () => {
      checkNameOfNetwork('Avalanche');
    });
  });

  describe('CASE2: Switch from Avalanche to Polygon', () => {
    it('step1: Change the network from Avalanche to Polygon', () => {
      changeNetwork('marketSelector_proto_polygon');
    });
    checkNameOfNetwork('Polygon');
  });

  describe('CASE3: Switch from Polygon to Fantom', () => {
    it('step1: Change the network from Polygon to Fantom', () => {
      changeNetwork('marketSelector_proto_fantom_testnet_v3');
    });
    checkNameOfNetwork('Fantom');
  });

  describe('CASE4:Switch from Fantom to Arbitrum V3', () => {
    it('step1:Change the network from Fantom to Arbitrum V3', () => {
      changeNetwork('marketSelector_proto_arbitrum_v3');
    });
    checkNameOfNetwork('Arbitrum');
  });
});
