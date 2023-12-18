import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { GovernanceV3Service } from 'src/services/GovernanceV3Service';
import { VotingMachineService } from 'src/services/VotingMachineService';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export type SubgraphProposal = {
  proposalId: string;
  ipfsHash: string;
  title: string;
  shortDescription: string;
  description: string;
  author: string;
};

const GOV_CORE_SUBGRAPH_URL =
  'https://api.goldsky.com/api/public/project_clk74pd7lueg738tw9sjh79d6/subgraphs/governance-v3/v2.0.1/gn';

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
  request<{ proposalCreateds: SubgraphProposal[] }>(GOV_CORE_SUBGRAPH_URL, getProposalsQuery, {
    first,
    skip,
  });

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

// TODO: group proposals by chain ID, query the correct voting contract for each proposal,
// and then merge the results together, orderd by propopsal id descending
// export const useGetVotingMachineProposalsData = (
//   proposals: Array<{ id: number; snapshotBlockHash: string }>,
//   enabled: boolean
// ) => {
//   const { votingMachineSerivce } = useSharedDependencies();
//   return useQuery({
//     queryFn: () => votingMachineSerivce.getProposalsData(proposals),
//     queryKey: ['votingMachineProposalsData'],
//     enabled: proposals?.length > 0 && enabled,
//     refetchOnMount: false,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//     // staleTime: Infinity, ????
//   });
// };
