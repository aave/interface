import { Wallet } from 'ethers';

export interface TokenRequest {
  tokenAddress: string;
  tokenCount?: string;
  name?: string;
  decimals?: number;
  // For aTokens: set the underlying balance then supply to the pool to get the aToken.
  // Set autoSupply: false for tests that are testing the supply flow themselves.
  poolAddress?: string;
  underlyingAsset?: string;
  autoSupply?: boolean;
}

export class TenderlyActions {
  public static tenderlyTokenRequest(tokens: TokenRequest[]) {
    it(`Token request `, () => {
      tokens.forEach(($token) => {
        cy.log(`Request: ${$token.name ?? $token.tokenAddress} ${$token.tokenCount}`);
      });
      Promise.all(
        tokens.map((token) => {
          window.tenderly.getERC20Token(window.address, token);
        })
      );
      cy.refresh();
    });
  }

  public static tenderlyTokenWithdraw(tokens: TokenRequest[], addressTo?: string) {
    it(`Token withdraw`, () => {
      tokens.forEach(($token) => {
        cy.log(`Withdraw: ${$token.name ?? $token.tokenAddress} ${$token.tokenCount}`);
      });
      Promise.all(
        tokens.map((token) => {
          const wallet = Wallet.createRandom();
          const _addressTo = addressTo || wallet.address;
          window.tenderly.getERC20Token(_addressTo, token);
        })
      );
      cy.refresh();
    });
  }
}
