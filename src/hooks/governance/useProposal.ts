import { ProposalData, VotingMachineProposal } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { GovernanceV3Service } from 'src/services/GovernanceV3Service';
import { VotingMachineService } from 'src/services/VotingMachineService';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export type SubgraphProposal = {
  proposalId: string;
  ipfsHash: string;
  title: string;
  shortDescription: string;
  description: string;
  author: string;
};

export interface EnhancedProposal {
  proposal: SubgraphProposal;
  proposalData: ProposalData;
  votingMachineData: VotingMachineProposal;
}

const getProposalQuery = gql`
  query getProposals($proposalId: Int!) {
    proposalCreateds(where: { proposalId: $proposalId }) {
      proposalId
      ipfsHash
      title
      shortDescription
      description
      author
    }
  }
`;

export const getProposal = async (proposalId: number) => {
  const result = await request<{ proposalCreateds: SubgraphProposal[] }>(
    governanceV3Config.governanceCoreSubgraphUrl,
    getProposalQuery,
    {
      proposalId,
    }
  );
  return result.proposalCreateds[0];
};

async function fetchProposal(
  proposalId: number,
  governanceV3Service: GovernanceV3Service,
  votingMachineService: VotingMachineService
): Promise<EnhancedProposal> {
  const proposal = await getProposal(proposalId);

  const proposalData = (await governanceV3Service.getProposalsData(+proposalId, +proposalId, 1))[0];

  const votingMachineData = (
    await votingMachineService.getProposalsData([
      {
        id: +proposalData.id,
        snapshotBlockHash: proposalData.proposalData.snapshotBlockHash,
        chainId: proposalData.votingChainId,
        votingPortalAddress: proposalData.proposalData.votingPortal,
      },
    ])
  )[0];

  return {
    proposal,
    proposalData,
    votingMachineData,
  };
}

export const useProposal = (proposalId: number) => {
  const { governanceV3Service, votingMachineSerivce } = useSharedDependencies();
  return useQuery({
    queryFn: () => fetchProposal(proposalId, governanceV3Service, votingMachineSerivce),
    queryKey: ['governance_proposal', proposalId],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
