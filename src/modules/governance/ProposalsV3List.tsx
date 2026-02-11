import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { Link, ROUTES } from 'src/components/primitives/Link';
import {
  useGovernanceProposals,
  useGovernanceProposalsSearch,
} from 'src/hooks/governance/useGovernanceProposals';
import { useRootStore } from 'src/store/root';
import { GOVERNANCE_PAGE } from 'src/utils/events';

import { ProposalListHeader } from './ProposalListHeader';
import { StateBadge, stringToState } from './StateBadge';
import { ProposalListItem } from './types';
import { VoteBar } from './VoteBar';

const ProposalListItemRow = ({ proposal }: { proposal: ProposalListItem }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

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
      onClick={() => trackEvent(GOVERNANCE_PAGE.VIEW_AIP, { AIP: proposal.id })}
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
          <StateBadge state={proposal.badgeState} loading={false} />
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
          percent={proposal.voteInfo.forPercent}
          votes={proposal.voteInfo.forVotes}
          sx={{ mb: 4 }}
          compact
        />
        <VoteBar
          percent={proposal.voteInfo.againstPercent}
          votes={proposal.voteInfo.againstVotes}
          compact
        />
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

export const ProposalsV3List = () => {
  const [proposalFilter, setProposalFilter] = useState<string>('all');
  const filterState = stringToState(proposalFilter);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const { results: searchResults, loading: loadingSearchResults } =
    useGovernanceProposalsSearch(searchTerm);

  const {
    data,
    isFetching: loadingProposals,
    fetchNextPage,
    hasNextPage,
  } = useGovernanceProposals();

  let listItems: ProposalListItem[] = [];

  if (searchTerm && searchResults.length > 0) {
    listItems = searchResults;
  } else if (!searchTerm && data) {
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
        <InfiniteScroll loadMore={() => fetchNextPage()} hasMore={hasNextPage && !searchTerm}>
          {listItems.map((proposal) => (
            <ProposalListItemRow key={proposal.id} proposal={proposal} />
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
