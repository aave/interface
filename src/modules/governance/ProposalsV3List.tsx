import { Box, Paper, Skeleton, Stack } from '@mui/material';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { Proposal, useProposals } from 'src/hooks/governance/useProposals';
import { useProposalsSearch } from 'src/hooks/governance/useProposalsSearch';

import { ProposalListHeader } from './ProposalListHeader';
import { ProposalV3ListItem } from './ProposalV3ListItem';
import { stringToState } from './StateBadge';
import { VoteBar } from './VoteBar';

export const ProposalsV3List = () => {
  const [proposalFilter, setProposalFilter] = useState<string>('all');
  const filterState = stringToState(proposalFilter);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const { results: searchResults, loading: loadingSearchResults } = useProposalsSearch(searchTerm);

  const { data, isFetching: loadingProposals, fetchNextPage, hasNextPage } = useProposals();

  let listItems: Proposal[] = [];
  if (searchTerm && searchResults.length > 0) {
    listItems = searchResults;
  }

  if (!searchTerm && data) {
    data.pages.forEach((page) => listItems.push(...page.proposals));
  }

  if (proposalFilter !== 'all') {
    listItems = listItems.filter((proposal) => proposal.badgeState === filterState);
  }

  return (
    <Paper>
      <ProposalListHeader
        proposalFilter={proposalFilter}
        handleProposalFilterChange={setProposalFilter}
        handleSearchQueryChange={setSearchTerm}
      />
      {listItems.length > 0 ? (
        <InfiniteScroll loadMore={() => fetchNextPage()} hasMore={hasNextPage}>
          {listItems.map((proposal) => (
            <ProposalV3ListItem key={proposal.subgraphProposal.id} proposal={proposal} />
          ))}
          {loadingProposals &&
            Array.from({ length: 5 }).map((_, i) => <ProposalListSkeleton key={i} />)}
        </InfiniteScroll>
      ) : ((!loadingSearchResults && searchTerm) ||
          (!loadingProposals && proposalFilter !== 'all')) &&
        listItems.length === 0 ? (
        <NoSearchResults searchTerm={searchTerm} />
      ) : (
        Array.from({ length: 4 }).map((_, i) => <ProposalListSkeleton key={i} />)
      )}
    </Paper>
  );
};

const ProposalListSkeleton = () => {
  return (
    <Box
      sx={{
        p: 6,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: {
            xs: '100%',
            lg: '70%',
          },
          pr: { xs: 0, lg: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="column"
          sx={{
            width: {
              xs: '100%',
              lg: '70%',
            },
            pr: { xs: 0, lg: 8 },
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 3, lg: 6 },
          }}
        >
          <Skeleton variant="rectangular" height={22} width={220} />
          <Skeleton variant="rectangular" height={24} width={350} />
        </Stack>
      </Stack>
      <Stack
        flexGrow={1}
        direction="column"
        justifyContent="center"
        sx={{
          pl: { xs: 0, lg: 18 },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <VoteBar yae percent={0} votes={0} sx={{ mb: 4 }} loading />
        <VoteBar percent={0} votes={0} loading />
      </Stack>
    </Box>
  );
};
