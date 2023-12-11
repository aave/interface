import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
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

export const useProposals = ({
  first,
  skip,
  totalCount,
}: {
  first: number;
  skip: number;
  totalCount: number | undefined;
}) => {
  return useQuery({
    queryFn: () => getProposals(first, skip),
    queryKey: ['proposals'],
    enabled: totalCount ? totalCount > 0 : false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data.proposalCreateds,
  });
};

export const useGetProposalCount = () => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getProposalCount(),
    queryKey: ['proposalCount'],
    enabled: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: Infinity, ????
  });
};

export const useGetProposalsData = ({
  fromId,
  toId,
  limit,
}: {
  fromId: number;
  toId: number;
  limit: number;
}) => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getProposalsData(fromId, toId, limit),
    queryKey: ['proposalsData'],
    enabled: true,
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

export const useGetVotingMachineProposalsData = (
  proposals: Array<{ id: number; snapshotBlockHash: string }>
) => {
  const { votingMachineSerivce } = useSharedDependencies();
  return useQuery({
    queryFn: () => votingMachineSerivce.getProposalsData(proposals),
    queryKey: ['votingMachineProposalsData'],
    enabled: proposals?.length > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // staleTime: Infinity, ????
  });
};
