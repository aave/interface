import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { fetchProposals, fetchSubgraphProposalsByIds } from './useProposals';

const searchProposalsQuery = gql`
  query search($query: String!) {
    proposalSearch(text: $query) {
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
    }
  );

export const useProposalsSearch = (query: string) => {
  const { votingMachineSerivce } = useSharedDependencies();

  const formattedQuery = query.trim().split(' ').join(' & ');

  const { data: ids, isFetching } = useQuery({
    queryFn: () => searchProposals(formattedQuery),
    enabled: query !== '' && query.length > 2,
    queryKey: ['searchProposals', formattedQuery],
    select: (data) => {
      console.log('data', data);
      return data.proposalSearch.map((prop) => prop.proposalId);
    },
  });

  const { data: proposals, isFetching: fetchingProposals } = useQuery({
    queryFn: async () => {
      const proposals = await fetchSubgraphProposalsByIds(ids || []);
      return fetchProposals(proposals, votingMachineSerivce);
    },
    queryKey: ['proposals_by_id', ids], // TODO
    enabled: ids !== undefined && ids.length > 0,
  });

  return {
    results: proposals?.proposals || [],
    loading: isFetching || fetchingProposals,
  };
};
