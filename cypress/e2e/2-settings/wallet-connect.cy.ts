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

describe('Manipulation on the wallet connect', () => {
  describe('CASE1: Disconnect and connect wallet using Wallet connect option', () => {
    configEnvWithTenderlyMainnetFork({});
    const walletButton = '#wallet-button';

    it('step1:Disconnect wallet', () => {
      cy.get(walletButton).click();
      cy.contains('Disconnect Wallet').click();
      cy.contains('Please, connect your wallet').should('be.visible');
    });

    it('step2:Connect wallet using wallet connect', () => {
      cy.get(walletButton).click();
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
    optionOnConnectionModal('Coinbase');
    checkElementsOnModal('.-cbwsdk-extension-dialog-box', 'Try the Coinbase Wallet extension');
    closeModal('.-cbwsdk-extension-dialog-box-cancel');
  });
});
