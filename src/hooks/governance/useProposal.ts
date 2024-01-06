import { ProposalData, VotingMachineProposal } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { GovernanceV3Service } from 'src/services/GovernanceV3Service';
import { VotingMachineService } from 'src/services/VotingMachineService';
import { useRootStore } from 'src/store/root';
import { governanceV3Config, ipfsGateway } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { SubgraphProposal } from './useProposals';

export interface EnhancedProposal {
  proposal: SubgraphProposal;
  proposalData: ProposalData;
  votingMachineData: VotingMachineProposal;
}

const getProposalQuery = gql`
  query getProposals($proposalId: Int!) {
    proposalCreateds(where: { proposalId: $proposalId }) {
      proposalId
      cid
      ipfsHash
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
  votingMachineService: VotingMachineService,
  user?: string
): Promise<EnhancedProposal> {
  const proposal = await getProposal(proposalId);

  const metadata = await getProposalMetadata(proposal.cid, ipfsGateway);
  const proposalWithMetadata = {
    ...proposal,
    ...metadata,
  };
  const proposalData = (await governanceV3Service.getProposalsData(+proposalId, +proposalId, 1))[0];

  const votingMachineData = (
    await votingMachineService.getProposalsData(
      [
        {
          id: +proposalData.id,
          snapshotBlockHash: proposalData.proposalData.snapshotBlockHash,
          chainId: proposalData.votingChainId,
          votingPortalAddress: proposalData.proposalData.votingPortal,
        },
      ],
      user
    )
  )[0];

  return {
    proposal: proposalWithMetadata,
    proposalData,
    votingMachineData,
  };
}

export const useProposal = (proposalId: number) => {
  const { governanceV3Service, votingMachineSerivce } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => fetchProposal(proposalId, governanceV3Service, votingMachineSerivce, user),
    queryKey: ['governance_proposal', proposalId, user],
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
