import { ProposalState } from '@aave/contract-helpers';
import Fuse from 'fuse.js';
import { GovernancePageProps } from 'pages/governance/index.governance';
import { useEffect, useMemo, useRef } from 'react';

type SearchFilters = {
  state: ProposalState | 'all';
  query: string;
};

type UseGovernanceSearcherParams = {
  filters: SearchFilters;
  proposals: GovernancePageProps['proposals'];
};

export const useGovernanceSearcher = ({ filters, proposals }: UseGovernanceSearcherParams) => {
  const searchEngineRef = useRef(
    new Fuse(proposals, {
      keys: ['ipfs.title', 'ipfs.shortDescription'],
      threshold: 0.3,
    })
  );

  useEffect(() => {
    searchEngineRef.current.setCollection(proposals);
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    const filteredByState = proposals.filter(
      (elem) => filters.state === 'all' || elem.proposal.state === filters.state
    );
    searchEngineRef.current.setCollection(filteredByState);
    if (!filters.query) return filteredByState;
    const filteredByQuery = searchEngineRef.current.search(filters.query);
    return filteredByQuery.map((elem) => elem.item);
  }, [filters.query, filters.state, proposals]);

  return { filteredProposals };
};
