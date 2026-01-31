import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { Link, ROUTES } from 'src/components/primitives/Link';
import {
  SimplifiedProposal,
  useProposalsCache,
  useProposalsSearchCache,
} from 'src/hooks/governance/useProposalsCache';

import { ProposalListHeader } from './ProposalListHeader';
import { ProposalBadgeState, StateBadge } from './StateBadge';
import { VoteBar } from './VoteBar';

/**
 * Map our cache state to ProposalBadgeState
 */
function mapStateToBadge(state: string): ProposalBadgeState {
  switch (state) {
    case 'created':
      return ProposalBadgeState.Created;
    case 'active':
      return ProposalBadgeState.OpenForVoting;
    case 'queued':
      return ProposalBadgeState.Passed;
    case 'executed':
      return ProposalBadgeState.Executed;
    case 'failed':
      return ProposalBadgeState.Failed;
    case 'cancelled':
      return ProposalBadgeState.Cancelled;
    default:
      return ProposalBadgeState.Created;
  }
}

/**
 * Convert 18 decimal vote count to human readable number
 */
function formatVotes(votes: string): number {
  const raw = parseFloat(votes) || 0;
  // Votes are stored with 18 decimals
  return raw / 1e18;
}

/**
 * Calculate vote percentages from string vote counts (18 decimals)
 */
function calculateVoteInfo(votesFor: string, votesAgainst: string) {
  const forVotes = formatVotes(votesFor);
  const againstVotes = formatVotes(votesAgainst);
  const total = forVotes + againstVotes;

  return {
    forVotes,
    againstVotes,
    forPercent: total > 0 ? (forVotes / total) * 100 : 0,
    againstPercent: total > 0 ? (againstVotes / total) * 100 : 0,
  };
}

/**
 * Simplified list item for cache-based proposals
 */
const ProposalCacheListItem = ({ proposal }: { proposal: SimplifiedProposal }) => {
  const badgeState = mapStateToBadge(proposal.state);
  const voteInfo = calculateVoteInfo(proposal.votesFor, proposal.votesAgainst);

  return (
    <Box
      sx={{
        p: 6,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      component={Link}
      href={ROUTES.dynamicRenderedProposal(+proposal.id)}
    >
      <Stack
        direction="column"
        gap={2}
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
        <Stack direction="row" gap={3} alignItems="center">
          <StateBadge state={badgeState} loading={false} />
        </Stack>
        <Typography variant="h3" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {proposal.title}
        </Typography>
        {proposal.author && (
          <Typography variant="caption" color="text.secondary">
            Author: {proposal.author.replace(/^@/, '')}
          </Typography>
        )}
        {proposal.shortDescription && (
          <Typography
            variant="description"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {proposal.shortDescription.replace(/^#+\s*/gm, '')}
          </Typography>
        )}
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
        <VoteBar
          yae
          percent={voteInfo.forPercent}
          votes={voteInfo.forVotes}
          sx={{ mb: 4 }}
          compact
        />
        <VoteBar percent={voteInfo.againstPercent} votes={voteInfo.againstVotes} compact />
      </Stack>
    </Box>
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
          width: { xs: '100%', lg: '70%' },
          pr: { xs: 0, lg: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="column"
          sx={{
            width: { xs: '100%', lg: '70%' },
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

/**
 * Proposals list that uses the local governance cache
 * instead of the subgraph + on-chain calls
 */
export const ProposalsCacheList = () => {
  const [proposalFilter, setProposalFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Map filter to our state names
  const stateFilterMap: Record<string, string | undefined> = {
    all: undefined,
    Created: 'created',
    'Open for voting': 'active',
    Success: 'queued',
    Executed: 'executed',
    Failed: 'failed',
    Cancelled: 'cancelled',
  };

  const stateFilter = stateFilterMap[proposalFilter];

  const { results: searchResults, loading: loadingSearchResults } =
    useProposalsSearchCache(searchTerm);
  const {
    data,
    isFetching: loadingProposals,
    fetchNextPage,
    hasNextPage,
  } = useProposalsCache(stateFilter);

  let listItems: SimplifiedProposal[] = [];

  if (searchTerm && searchResults.length > 0) {
    listItems = searchResults;
  } else if (!searchTerm && data) {
    data.pages.forEach((page) => listItems.push(...page.proposals));
  }

  // Apply badge filter for search results (search doesn't filter by state server-side)
  if (searchTerm && proposalFilter !== 'all') {
    const targetState = stateFilterMap[proposalFilter];
    if (targetState) {
      listItems = listItems.filter((p) => p.state === targetState);
    }
  }

  return (
    <Paper>
      <ProposalListHeader
        proposalFilter={proposalFilter}
        handleProposalFilterChange={setProposalFilter}
        handleSearchQueryChange={setSearchTerm}
      />
      {listItems.length > 0 ? (
        <InfiniteScroll loadMore={() => fetchNextPage()} hasMore={hasNextPage && !searchTerm}>
          {listItems.map((proposal) => (
            <ProposalCacheListItem key={proposal.id} proposal={proposal} />
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
