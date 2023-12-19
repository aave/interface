import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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

const getProposalsQuery = gql`
  query getProposals($first: Int!, $skip: Int!) {
    proposalCreateds(orderBy: proposalId, orderDirection: desc, first: $first, skip: $skip) {
      proposalId
      ipfsHash
      title
      shortDescription
      description
      author
    }
  }
`;

export const getProposals = (first: number, skip: number) =>
  request<{ proposalCreateds: SubgraphProposal[] }>(
    governanceV3Config.governanceCoreSubgraphUrl,
    getProposalsQuery,
    {
      first,
      skip,
    }
  );

const PAGE_SIZE = 10;

async function fetchProposals(
  pageParam: number,
  governanceV3Service: GovernanceV3Service,
  votingMachineSerivce: VotingMachineService
) {
  const result = await getProposals(PAGE_SIZE, pageParam * PAGE_SIZE);
  const proposals = result.proposalCreateds;

  const fromId = proposals[0].proposalId;
  const toId = proposals[proposals.length - 1].proposalId;

  const proposalData = await governanceV3Service.getProposalsData(+fromId, +toId, PAGE_SIZE);

  const votingMachineParams =
    proposalData?.map((p) => ({
      id: +p.id,
      snapshotBlockHash: p.proposalData.snapshotBlockHash,
      chainId: p.votingChainId,
      votingPortalAddress: p.proposalData.votingPortal,
    })) ?? [];

  const votingMachingData = await votingMachineSerivce.getProposalsData(votingMachineParams);

  return {
    proposals,
    proposalData,
    votingMachingData,
  };
}

export const useProposals = (totalCount: number) => {
  const { governanceV3Service, votingMachineSerivce } = useSharedDependencies();
  return useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      return fetchProposals(pageParam, governanceV3Service, votingMachineSerivce);
    },
    queryKey: ['proposals'],
    enabled: totalCount > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.proposals.length < PAGE_SIZE) {
        return undefined;
      }

      return allPages.length;
    },
  });
};

export const useGetProposalCount = () => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getProposalCount(),
    queryKey: ['proposalCount'],
    enabled: true,
    initialData: 0,
    // staleTime: Infinity, ????
  });
};

export const useGetProposalsData = ({
  fromId,
  toId,
  limit,
  enabled,
}: {
  fromId: number;
  toId: number;
  limit: number;
  enabled: boolean;
}) => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getProposalsData(fromId, toId, limit),
    queryKey: ['proposalsData', fromId, toId],
    enabled: enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: Infinity, ????
  });
};

// voting configs should rarely be changed, so set cache time to infinity
export const useGetVotingConfig = () => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getVotingConfig(),
    queryKey: ['votingConfig'],
    enabled: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
};
