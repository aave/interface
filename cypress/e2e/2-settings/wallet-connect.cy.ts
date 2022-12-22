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

const walletButtonlocator = '#wallet-button';

describe('Manipulation on the wallet connect', () => {
  describe('CASE1: Disconnect and connect wallet using Wallet connect option', () => {
    configEnvWithTenderlyMainnetFork({});

    it('step1:Disconnect wallet', () => {
      cy.wait(1000);
      cy.get(walletButtonlocator).click();
      cy.wait(3000);
      cy.contains('Disconnect').click();
      cy.contains('Please, connect your wallet').should('be.visible');
    });

    it('step2:Connect wallet using wallet connect', () => {
      cy.get(walletButtonlocator).click();
      optionOnConnectionModal('WalletConnect');
      checkElementsOnModal(
        '#walletconnect-qrcode-text',
        'Scan QR code with a WalletConnect-compatible wallet'
      );
      cy.get('.walletconnect-qrcode__image').should('be.visible');
      closeModal('#walletconnect-qrcode-close');
    });
  });
});

describe('CASE2:Connect and disconnect wallet over Coinbase', () => {
  it('step1:Connect wallet over Coinbase', () => {
    cy.wait(1000);
    cy.get(walletButtonlocator).click();
    cy.wait(3000);
    optionOnConnectionModal('Coinbase');
    checkElementsOnModal('.-cbwsdk-extension-dialog-box', 'Try the Coinbase Wallet extension');
    closeModal('.-cbwsdk-extension-dialog-box-cancel');
  });
});
