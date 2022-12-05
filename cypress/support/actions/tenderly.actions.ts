import { Wallet } from 'ethers';

export type TokenRequest = {
  tokenAddress: string;
  donorAddress?: string;
  tokenCount?: string;
};

export class TenderlyActions {
  public static tenderlyTokenRequest(tokens: TokenRequest[], addressFrom?: string) {
    return it(`Token request `, () => {
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
    return it(`Token withdraw `, () => {
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
