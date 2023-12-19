import {
  AccessLevel,
  ChainId,
  GovernanceCoreService,
  GovernanceDataHelperService,
} from '@aave/contract-helpers';
import { governanceV3Config, votingChainIds } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export class GovernanceV3Service {
  private getDataHelperService() {
    const provider = getProvider(ChainId.sepolia); // TODO: pass in market data
    return new GovernanceDataHelperService(
      governanceV3Config.addresses.GOVERNANCE_DATA_HELPER,
      provider
    );
  }

  private getCoreService() {
    const provider = getProvider(ChainId.sepolia); // TODO: pass in market data
    return new GovernanceCoreService(governanceV3Config.addresses.GOVERNANCE_CORE, provider);
  }

  async getProposalsData(from = 0, to = 0, limit = 10) {
    const dataHelperService = this.getDataHelperService();
    const proposals = await dataHelperService.getProposalsData(
      governanceV3Config.addresses.GOVERNANCE_CORE,
      from,
      to,
      limit
    );
    return proposals;
  }

  async getVotingConfig() {
    const dataHelperService = this.getDataHelperService();
    const votingConfig = await dataHelperService.getConstants(
      governanceV3Config.addresses.GOVERNANCE_CORE,
      [AccessLevel.Short_Executor, AccessLevel.Long_Executor]
    );
    return votingConfig;
  }

  async getProposalCount() {
    const coreService = this.getCoreService();
    return coreService.getProposalCount();
  }

  async getRepresentationData(user: string) {
    const dataHelperService = this.getDataHelperService();
    const representationData = await dataHelperService.getRepresentationData(
      governanceV3Config.addresses.GOVERNANCE_CORE,
      user,
      [...votingChainIds]
    );
    return representationData;
  }

  updateRepresentativesForChain(
    user: string,
    representatives: Array<{ chainId: ChainId; representative: string }>
  ) {
    const coreService = this.getCoreService();
    return coreService.updateRepresentativesForChain(user, representatives);
  }
}
