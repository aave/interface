import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';

describe('Disconnecting and connecting wallet using wallet connect', () => {
  configEnvWithTenderlyMainnetFork({});
  const walletButton = '#wallet-button';
  it('CASE1:Disconnect wallet', () => {
    cy.get(walletButton).click();
    cy.contains('Disconnect Wallet').click();
    cy.contains('Please, connect your wallet').should('be.visible');
  });

  it('CASE2:Connect wallet using wallet connect', () => {
    cy.get(walletButton).click();
    cy.get('.MuiButton-root').contains('WalletConnect').click({ force: true });
    cy.get('#walletconnect-qrcode-text').contains(
      'Scan QR code with a WalletConnect-compatible wallet'
    );
    cy.get('.walletconnect-qrcode__image').should('be.visible');
  });
});
