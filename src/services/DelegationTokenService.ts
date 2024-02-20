import {
  AaveTokenV3Service,
  DelegateMetaSigParams,
  MetaDelegateHelperService,
  MetaDelegateParams,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { PopulatedTransaction } from 'ethers';
import { FixedPointDecimal } from 'src/architecture/FixedPointDecimal';
import { governanceV3Config } from 'src/ui-config/governanceConfig';

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

  private getBatchDelegationTokenService(chainId: number) {
    const provider = this.getProvider(chainId);

    const GOVERNANCE_META_HELPER = governanceV3Config.addresses.GOVERNANCE_META_HELPER;

    return new MetaDelegateHelperService(GOVERNANCE_META_HELPER, provider);
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

  // NOTE using MetaDelegateHelperService methods below
  async getTokenDelegatees(user: string, token: string, chainId: number) {
    const service = this.getDelegationTokenService(token, chainId);
    return service.getDelegateeData(user);
  }

  async prepareV3DelegateByTypeSignature({
    underlyingAsset,
    delegatee,
    delegationType,
    delegator,
    increaseNonce,
    governanceTokenName,
    nonce,
    connectedChainId,
    deadline,
  }: DelegateMetaSigParams): Promise<string> {
    const service = this.getBatchDelegationTokenService(connectedChainId);
    return service.prepareV3DelegateByTypeSignature({
      underlyingAsset,
      delegatee,
      delegationType,
      delegator,
      increaseNonce,
      governanceTokenName,
      nonce,
      connectedChainId,
      deadline,
    });
  }

  async batchMetaDelegate(
    user: string,
    delegateParams: MetaDelegateParams[],
    connectedChainId: number
  ): Promise<PopulatedTransaction> {
    const service = this.getBatchDelegationTokenService(connectedChainId);
    return service.batchMetaDelegate(user, delegateParams);
  }
}
