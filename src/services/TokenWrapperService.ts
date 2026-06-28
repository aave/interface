import { TokenWrapperServiceInterface } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

export class TokenWrapperService {
  private tokenWrapperService: {
    [chainId: number]: { [tokenWrapperAddress: string]: TokenWrapperServiceInterface };
  } = {};

  constructor(private chainId: number, private provider: Provider) {}

  private async getService(tokenWrapperAddress: string) {
    if (!this.tokenWrapperService[this.chainId]) {
      this.tokenWrapperService[this.chainId] = {};
    }

    if (!this.tokenWrapperService[this.chainId][tokenWrapperAddress]) {
      this.tokenWrapperService[this.chainId][tokenWrapperAddress] = new (
        await import('@aave/contract-helpers')
      ).TokenWrapperService(this.provider, tokenWrapperAddress);
    }

    return this.tokenWrapperService[this.chainId][tokenWrapperAddress];
  }

  public async getTokenInForTokenOut(
    amount: string,
    tokenWrapperAddress: string
  ): Promise<BigNumber> {
    const service = await this.getService(tokenWrapperAddress);
    return service.getTokenInForTokenOut(amount);
  }

  public async getTokenOutForTokenIn(
    amount: string,
    tokenWrapperAddress: string
  ): Promise<BigNumber> {
    const service = await this.getService(tokenWrapperAddress);
    return service.getTokenOutForTokenIn(amount);
  }

  public async supplyWrappedToken(amount: string, tokenWrapperAddress: string, user: string) {
    const service = await this.getService(tokenWrapperAddress);
    return service.supplyToken(amount, user, '0');
  }

  public async supplyWrappedTokenWithPermit(
    amount: string,
    tokenWrapperAddress: string,
    user: string,
    deadline: string,
    signature: SignatureLike
  ) {
    const service = await this.getService(tokenWrapperAddress);
    return service.supplyTokenWithPermit({
      amount,
      onBehalfOf: user,
      referralCode: '0',
      deadline,
      signature,
    });
  }

  public async withdrawWrappedToken(amount: string, tokenWrapperAddress: string, user: string) {
    const service = await this.getService(tokenWrapperAddress);
    return service.withdrawToken(amount, user);
  }

  public async withdrawWrappedTokenWithPermit(
    amount: string,
    tokenWrapperAddress: string,
    user: string,
    deadline: string,
    signature: SignatureLike
  ) {
    const service = await this.getService(tokenWrapperAddress);
    return service.withdrawTokenWithPermit(amount, user, deadline, signature);
  }
}
