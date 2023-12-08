import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

type Proposal = {
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
  query getProposals {
    proposalCreateds {
      proposalId
      ipfsHash
      title
      shortDescription
      description
      author
    }
  }
`;

export const getProposals = request<{ proposalCreateds: Proposal[] }>(
  GOV_CORE_SUBGRAPH_URL,
  getProposalsQuery
);

export const useProposals = () => {
  return useQuery({
    queryFn: () => getProposals,
    queryKey: ['proposals'],
    enabled: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data.proposalCreateds,
  });
};

export const useGetProposalsData = () => {
  const { governanceV3Service } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceV3Service.getProposalsData(),
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
