import { AaveTokenV3Service } from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { FixedPointDecimal } from 'src/architecture/FixedPointDecimal';

export interface TokenDelegationPower {
  address: string;
  votingPower: FixedPointDecimal;
  propositionPower: FixedPointDecimal;
}

export class DelegationTokenService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private getDelegationTokenService(tokenAddress: string, chainId: number) {
    const provider = this.getProvider(chainId);
    return new AaveTokenV3Service(tokenAddress, provider);
  }

  async getTokenPowers(
    user: string,
    token: string,
    chainId: number
  ): Promise<TokenDelegationPower> {
    const service = this.getDelegationTokenService(token, chainId);
    const result = await service.getPowers(user);
    return {
      address: token,
      votingPower: new FixedPointDecimal(result.votingPower, 18),
      propositionPower: new FixedPointDecimal(result.propositionPower, 18),
    };
  }

  async getTokenDelegatees(user: string, token: string, chainId: number) {
    const service = this.getDelegationTokenService(token, chainId);
    return service.getDelegateeData(user);
  }
}
