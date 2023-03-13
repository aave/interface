import { LinearProgress, Paper } from '@mui/material';
import Fuse from 'fuse.js';
import { GovernancePageProps } from 'pages/governance/index.governance';
import { useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { usePolling } from 'src/hooks/usePolling';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { ProposalListHeader } from './ProposalListHeader';
import { ProposalListItem } from './ProposalListItem';
import { enhanceProposalWithTimes } from './utils/formatProposal';

export function ProposalsList({ proposals: initialProposals }: GovernancePageProps) {
  // will only initially be set to true, till the client is hydrated with new proposals
  const [loadingNewProposals, setLoadingNewProposals] = useState(true);
  const [updatingPendingProposals, setUpdatingPendingProposals] = useState(true);
  const [proposals, setProposals] = useState(initialProposals);
  const [proposalFilter, setProposalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedIndex, setLoadedIndex] = useState(1);
  const searchEngineRef = useRef(
    new Fuse(initialProposals, {
      keys: ['ipfs.title', 'ipfs.shortDescription'],
      threshold: 0.3,
    })
  );

  async function fetchNewProposals() {
    try {
      const count = await governanceContract.getProposalsCount();
      const nextProposals: GovernancePageProps['proposals'] = [];
      console.log(`fetching ${count - proposals.length} new proposals`);
      if (count - proposals.length) {
        for (let i = proposals.length; i < count; i++) {
          const { values, ...rest } = await governanceContract.getProposal({ proposalId: i });
          const proposal = await enhanceProposalWithTimes(rest);
          const proposalMetadata = await getProposalMetadata(
            proposal.ipfsHash,
            governanceConfig.ipfsGateway
          );
          nextProposals.unshift({
            ipfs: {
              id: i,
              originalHash: proposal.ipfsHash,
              ...proposalMetadata,
            },
            proposal: proposal,
            prerendered: false,
          });
        }
        nextProposals.map((elem) => searchEngineRef.current.add(elem));
        setProposals((p) => [...nextProposals, ...p]);
      }
      setLoadingNewProposals(false);
    } catch (e) {
      console.log('error fetching new proposals', e);
    }
  }

  async function updatePendingProposals() {
    const pendingProposals = proposals.filter(
      ({ proposal }) => !isProposalStateImmutable(proposal)
    );
    console.log('update pending proposals', pendingProposals.length);

    try {
      if (pendingProposals.length) {
        const updatedProposals = await Promise.all(
          pendingProposals.map(async ({ proposal }) => {
            const { values, ...rest } = await governanceContract.getProposal({
              proposalId: proposal.id,
            });
            return enhanceProposalWithTimes(rest);
          })
        );
        setProposals((proposals) => {
          updatedProposals.map((proposal) => {
            proposals[proposals.length - 1 - proposal.id].proposal = proposal;
            proposals[proposals.length - 1 - proposal.id].prerendered = false;
          });
          return proposals;
        });
      }
      setUpdatingPendingProposals(false);
    } catch (e) {
      console.log('error updating proposals', e);
    }
  }

  usePolling(fetchNewProposals, 60000, false, [proposals.length]);
  usePolling(updatePendingProposals, 30000, false, [proposals.length]);

  const filteredByState = useMemo(() => {
    const filtered = proposals.filter(
      (item) => proposalFilter === 'all' || item.proposal.state === proposalFilter
    );
    searchEngineRef.current.setCollection(filtered);
    return filtered;
  }, [proposals, proposalFilter]);

  const filteredByQuery = useMemo(() => {
    if (!searchQuery) return filteredByState;
    const filteredByQuery = searchEngineRef.current.search(searchQuery);
    return filteredByQuery.map((elem) => elem.item);
  }, [searchQuery, filteredByState]);

  const loadedProposals = useMemo(
    () => filteredByQuery.slice(0, loadedIndex * 10),
    [filteredByQuery, loadedIndex]
  );

  const onSearchTermChange = (value: string) => {
    setLoadedIndex(1);
    setSearchQuery(value);
  };

  const handleLoadMore = () => {
    setLoadedIndex((loadedIndex) => loadedIndex + 1);
  };

  return (
    <Paper>
      <ProposalListHeader
        proposalFilter={proposalFilter}
        handleProposalFilterChange={setProposalFilter}
        handleSearchQueryChange={onSearchTermChange}
      />
      {(loadingNewProposals || updatingPendingProposals) && <LinearProgress />}
      {loadedProposals.length ? (
        <InfiniteScroll
          pageStart={1}
          loadMore={handleLoadMore}
          hasMore={loadedProposals.length < filteredByQuery.length}
        >
          {loadedProposals.map(({ proposal, prerendered, ipfs }) => (
            <ProposalListItem
              key={proposal.id}
              proposal={proposal}
              ipfs={ipfs}
              prerendered={prerendered}
            />
          ))}
        </InfiniteScroll>
      ) : (
        <NoSearchResults searchTerm={searchQuery} />
      )}
    </Paper>
  );
}
