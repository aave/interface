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

  private getDelegationTokenService(tokenAddress: string) {
    const provider = this.getProvider(governanceV3Config.coreChainId);
    return new AaveTokenV3Service(tokenAddress, provider);
  }

  private getBatchDelegationTokenService() {
    const provider = this.getProvider(governanceV3Config.coreChainId);

    const GOVERNANCE_META_HELPER = governanceV3Config.addresses.GOVERNANCE_META_HELPER;

    return new MetaDelegateHelperService(GOVERNANCE_META_HELPER, provider);
  }

  async getTokenPowers(user: string, token: string): Promise<TokenDelegationPower> {
    const service = this.getDelegationTokenService(token);
    const result = await service.getPowers(user);
    return {
      address: token,
      votingPower: new FixedPointDecimal(result.votingPower, 18),
      propositionPower: new FixedPointDecimal(result.propositionPower, 18),
    };
  }

  // NOTE using MetaDelegateHelperService methods below
  async getTokenDelegatees(user: string, token: string) {
    const service = this.getDelegationTokenService(token);
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
    deadline,
  }: DelegateMetaSigParams): Promise<string> {
    const service = this.getBatchDelegationTokenService();
    return service.prepareV3DelegateByTypeSignature({
      underlyingAsset,
      delegatee,
      delegationType,
      delegator,
      increaseNonce,
      governanceTokenName,
      nonce,
      connectedChainId: governanceV3Config.coreChainId,
      deadline,
    });
  }

  async batchMetaDelegate(
    user: string,
    delegateParams: MetaDelegateParams[]
  ): Promise<PopulatedTransaction> {
    const service = this.getBatchDelegationTokenService();
    return service.batchMetaDelegate(user, delegateParams);
  }
}
