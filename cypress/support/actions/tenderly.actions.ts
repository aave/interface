import { Wallet } from 'ethers';

export interface TokenRequest {
  tokenAddress: string;
  donorAddress?: string;
  tokenCount?: string;
  name: string;
}

export class TenderlyActions {
  public static tenderlyTokenRequest(tokens: TokenRequest[], addressFrom?: string) {
    it(`Token request `, () => {
      tokens.forEach(($token) => {
        cy.log(`Request: ${$token.name} ${$token.tokenCount}`);
      });
      Promise.all(
        tokens.map((token) => {
          const _addressFrom = addressFrom || token.donorAddress;
          window.tenderly.getERC20Token(
            window.address,
            token.tokenAddress,
            _addressFrom,
            token.tokenCount
          );
        })
      );
      cy.refresh();
    });
  }

  public static tenderlyTokenWithdraw(tokens: TokenRequest[], addressTo?: string) {
    it(`Token withdraw`, () => {
      tokens.forEach(($token) => {
        cy.log(`Withdraw: ${$token.name} ${$token.tokenCount}`);
      });
      Promise.all(
        tokens.map((token) => {
          const wallet = Wallet.createRandom();
          const _addressTo = addressTo || wallet.address;
          window.tenderly.getERC20Token(
            _addressTo,
            token.tokenAddress,
            window.address,
            token.tokenCount
          );
        })
      );
      cy.refresh();
    });
  }
}
