import { VotingMachineDataHelperService, VotingMachineProposal } from '@aave/contract-helpers';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { governanceV3Config, VotingChain } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

type VotingChainProposal = {
  [key in VotingChain]: {
    [votingPortalAddress: string]: Array<{
      id: number;
      snapshotBlockHash: string;
    }>;
  };
};

export class VotingMachineService {
  private getDataHelperService(chainId: VotingChain) {
    const provider = getProvider(chainId);
    governanceV3Config.votingChainConfig;
    return new VotingMachineDataHelperService(
      governanceV3Config.votingChainConfig[chainId].votingPortalDataHelperAddress,
      provider
    );
  }
  async getProposalsData(
    proposals: Array<{
      id: number;
      snapshotBlockHash: string;
      chainId: number;
      votingPortalAddress: string;
    }>,
    user?: string
  ) {
    const proposalsByVotingChainId: VotingChainProposal = proposals.reduce((acc, proposal) => {
      const chainId: VotingChain = proposal.chainId;
      const votingPortalAddress = proposal.votingPortalAddress;

      if (!acc[chainId]) {
        acc[chainId] = {};
      }

      if (!acc[chainId][votingPortalAddress]) {
        acc[chainId][votingPortalAddress] = [];
      }

      acc[chainId][votingPortalAddress].push({
        id: proposal.id,
        snapshotBlockHash: proposal.snapshotBlockHash,
      });
      return acc;
    }, {} as VotingChainProposal);

    console.log('props by chain id', proposalsByVotingChainId);

    const promises: Promise<VotingMachineProposal[]>[] = [];
    Object.entries(proposalsByVotingChainId).forEach(([chainId, proposals]) => {
      const chainIdKey = +chainId as VotingChain;
      const dataHelperService = this.getDataHelperService(chainIdKey);
      Object.entries(proposals).forEach(([votingPortalAddress, proposals]) => {
        promises.push(
          dataHelperService.getProposalsData(
            governanceV3Config.votingChainConfig[chainIdKey].portalToMachineMap[
              votingPortalAddress
            ],
            proposals,
            user || ZERO_ADDRESS
          )
        );
      });
    });

    const data = await Promise.all(promises);

    const merged = data.reduce((acc, proposals) => {
      return [...acc, ...proposals];
    }, [] as VotingMachineProposal[]);

    return merged.sort((a, b) => +b.proposalData.id - +a.proposalData.id);
  }
}
