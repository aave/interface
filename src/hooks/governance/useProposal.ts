import { VotingMachineProposal } from '@aave/contract-helpers';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { VotingMachineService } from 'src/services/VotingMachineService';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { enhanceProposalWithMetadata, Proposal, SubgraphProposal } from './useProposals';

export interface EnhancedProposal {
  proposal: Proposal;
  votingMachineData: VotingMachineProposal;
}

const getProposalQuery = gql`
  query getProposal($id: Int!) {
    proposal(id: $id) {
      id
      creator
      accessLevel
      ipfsHash
      proposalMetadata {
        id
        title
        rawContent
      }
      state
      votingPortal {
        id
        votingMachineChainId
        votingMachine
        enabled
      }
      votingConfig {
        id
        cooldownBeforeVotingStart
        votingDuration
        yesThreshold
        yesNoDifferential
        minPropositionPower
      }
      payloads {
        id
        chainId
        accessLevel
        payloadsController
      }
      transactions {
        id
        created {
          id
          blockNumber
          timestamp
        }
        active {
          id
          blockNumber
          timestamp
        }
        queued {
          id
          blockNumber
          timestamp
        }
        failed {
          id
          blockNumber
          timestamp
        }
        executed {
          id
          blockNumber
          timestamp
        }
        canceled {
          id
          blockNumber
          timestamp
        }
      }
      votingDuration
      snapshotBlockHash
      votes {
        id
        forVotes
        againstVotes
      }
      constants {
        id
        precisionDivider
        cooldownPeriod
        expirationTime
        cancellationFee
      }
    }
  }
`;

export const getProposal = async (proposalId: number) => {
  const result = await request<{ proposal: SubgraphProposal }>(
    governanceV3Config.governanceCoreSubgraphUrl,
    getProposalQuery,
    {
      id: proposalId,
    }
  );
  return result.proposal;
};

async function fetchProposal(
  proposalId: number,
  votingMachineService: VotingMachineService,
  user?: string
): Promise<EnhancedProposal> {
  const proposal = await getProposal(proposalId);

  const proposalWithMetadata = await enhanceProposalWithMetadata(proposal);

  const votingMachineData = (
    await votingMachineService.getProposalsData(
      [
        {
          id: +proposal.id,
          snapshotBlockHash: proposal.snapshotBlockHash || '',
          chainId: +proposal.votingPortal.votingMachineChainId,
          votingMachineAddress: proposal.votingPortal.votingMachine,
        },
      ],
      user
    )
  )[0];

  const proposalsWithVotes = {
    ...proposalWithMetadata,
    votes: {
      forVotes: votingMachineData.proposalData.forVotes,
      againstVotes: votingMachineData.proposalData.againstVotes,
    },
  };

  return {
    proposal: proposalsWithVotes,
    votingMachineData,
  };
}

export const useProposal = (proposalId: number) => {
  const { votingMachineSerivce } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => fetchProposal(proposalId, votingMachineSerivce, user),
    queryKey: ['governance_proposal', proposalId, user],
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
