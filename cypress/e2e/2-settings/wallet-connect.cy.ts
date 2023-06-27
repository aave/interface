import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

export const optionOnConnectionModal = (option: string) => {
  cy.get('.MuiButton-root').contains(option).click({ force: true });
};

export const checkElementsOnModal = (element1: string, element2: string) => {
  cy.get(element1).contains(element2).click();
};
export const closeModal = (selector: string) => {
  cy.get(selector).click();
};

export const getWalletConnectIframe = () => {
  return cy.get('iframe[id="verify-api"]').its('0.contentDocument').should('exist');
};

const walletButtonlocator = '#wallet-button';

describe('Manipulation on the wallet connect', () => {
  describe('CASE1: Disconnect and connect wallet using Wallet connect option', () => {
    configEnvWithTenderlyMainnetFork({});

    it('Disconnect wallet', () => {
      cy.wait(2000);
      cy.get(walletButtonlocator).click();
      cy.wait(7000);
      cy.get(`[data-cy="disconnect-wallet"]`).click();
      cy.contains('Please, connect your wallet').should('be.visible');
    });

    it('Connect wallet over Coinbase', () => {
      cy.wait(1000);
      cy.get(walletButtonlocator).click();
      cy.wait(3000);
      optionOnConnectionModal('Coinbase');
      checkElementsOnModal('.-cbwsdk-extension-dialog-box', 'Try the Coinbase Wallet extension');
      closeModal('.-cbwsdk-extension-dialog-box-cancel');
    });
  });
});
