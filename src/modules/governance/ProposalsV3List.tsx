import { VotingConfig } from '@aave/contract-helpers';
import { Box, Paper, Skeleton, Stack } from '@mui/material';
import { Fragment, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {
  useGetProposalCount,
  useGetVotingConfig,
  useProposals,
} from 'src/hooks/governance/useProposals';

import { ProposalListHeader } from './ProposalListHeader';
import { ProposalV3ListItem } from './ProposalV3ListItem';
import { formatProposalV3 } from './utils/formatProposal';
import { VoteBar } from './VoteBar';

export const ProposalsV3List = () => {
  // TODO
  const [proposalFilter, setProposalFilter] = useState<string>('all');

  const { data: totalCount, isFetching: fetchingProposalCount } = useGetProposalCount();
  const { data, isFetching: fetchingProposals, fetchNextPage } = useProposals(totalCount);
  const { data: config, isFetching: fetchingVotingConfig } = useGetVotingConfig();

  const totalNumberOfProposalsLoaded = data?.pages.reduce(
    (acc, page) => acc + page.proposals.length,
    0
  );

  const loading = fetchingProposalCount || fetchingProposals || fetchingVotingConfig;

  return (
    <Paper>
      <ProposalListHeader
        proposalFilter={proposalFilter}
        handleProposalFilterChange={setProposalFilter}
        handleSearchQueryChange={(value: string) => console.log(value)}
      />
      {data && config ? (
        <InfiniteScroll
          loadMore={() => fetchNextPage()}
          hasMore={
            totalNumberOfProposalsLoaded === undefined || totalNumberOfProposalsLoaded < totalCount
          }
        >
          {data?.pages.map((group, i) => (
            <Fragment key={i}>
              {group.proposals.map((proposal, index) => (
                <ProposalV3ListItem
                  key={proposal.proposalId}
                  proposalData={group.proposalData[index]}
                  votingMachineData={group.votingMachingData[index]}
                  votingConfig={
                    config.votingConfigs.find(
                      (c) => c.accessLevel === group.proposalData[index].proposalData.accessLevel
                    ) as VotingConfig
                  }
                  {...formatProposalV3(
                    proposal,
                    group.proposalData[index],
                    config,
                    group.votingMachingData[index]
                  )}
                />
              ))}
            </Fragment>
          ))}
          {loading && Array.from({ length: 5 }).map((_, i) => <ProposalListSkeleton key={i} />)}
        </InfiniteScroll>
      ) : (
        Array.from({ length: 5 }).map((_, i) => <ProposalListSkeleton key={i} />)
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
        gap={2}
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
          <Skeleton variant="rectangular" height={22} width={220} />
          <Skeleton variant="rectangular" height={28} width={350} />
          <Skeleton variant="rectangular" height={40} width={500} />
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
