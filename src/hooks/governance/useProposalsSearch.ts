import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { fetchProposals, fetchSubgraphProposalsByIds } from './useProposals';

const SEARCH_RESULTS_LIMIT = 10;

const searchProposalsQuery = gql`
  query search($query: String!, $first: Int!) {
    proposalSearch(text: $query, first: $first) {
      proposalId
    }
  }
`;

export const searchProposals = (query: string) =>
  request<{ proposalSearch: Array<{ proposalId: string }> }>(
    governanceV3Config.governanceCoreSubgraphUrl,
    searchProposalsQuery,
    {
      query,
      first: SEARCH_RESULTS_LIMIT,
    }
  );

export const useProposalsSearch = (query: string) => {
  const { votingMachineSerivce, governanceV3Service } = useSharedDependencies();

  const formattedQuery = query.trim().split(' ').join(' & ');

  const { data: ids, isFetching } = useQuery({
    queryFn: () => searchProposals(formattedQuery),
    enabled: query !== '',
    queryKey: ['searchProposals', formattedQuery],
    select: (data) => {
      return data.proposalSearch.map((prop) => prop.proposalId);
    },
  });

  const { data: proposals, isFetching: fetchingProposals } = useQuery({
    queryFn: async () => {
      const proposals = await fetchSubgraphProposalsByIds(ids || []);
      return fetchProposals(proposals, votingMachineSerivce, governanceV3Service);
    },
    queryKey: ['proposals_by_id', ids],
    cacheTime: 0,
    enabled: ids !== undefined && ids.length > 0,
  });

  return {
    results: proposals?.proposals || [],
    loading: isFetching || fetchingProposals,
  };
};
