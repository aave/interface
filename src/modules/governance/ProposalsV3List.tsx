import {
  AccessLevel,
  Constants,
  ProposalData,
  ProposalV3State,
  VotingMachineProposal,
} from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { LinearProgress, Paper } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Fragment, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { NoSearchResults } from 'src/components/NoSearchResults';
import {
  SubgraphProposal,
  useGetProposalCount,
  useGetVotingConfig,
  useProposals,
} from 'src/hooks/governance/useProposals';

import { isDifferentialReached, isQuorumReached } from './helpers';
import { ProposalListHeader } from './ProposalListHeader';
import { ProposalV3ListItem } from './ProposalV3ListItem';

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
      {loading && <LinearProgress />}
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
                  {...formatProposal(
                    proposal,
                    group.proposalData[index],
                    config,
                    group.votingMachingData[index]
                  )}
                />
              ))}
            </Fragment>
          ))}
        </InfiniteScroll>
      ) : (
        <NoSearchResults searchTerm="todo" />
      )}
    </Paper>
  );
};

type FormattedProposal = {
  id: string;
  title: string;
  shortDescription: string;
  proposalState: ProposalV3State;
  accessLevel: AccessLevel;
  forVotes: number;
  againstVotes: number;
  forPercent: number;
  againstPercent: number;
  quorumReached: boolean;
  diffReached: boolean;
  votingChainId: number;
};

const formatProposal = (
  proposal: SubgraphProposal,
  proposalData: ProposalData,
  constants: Constants,
  votingMachineData: VotingMachineProposal
): FormattedProposal => {
  const quorumReached = isQuorumReached(
    proposalData.proposalData.forVotes,
    constants.votingConfigs[proposalData.proposalData.accessLevel].config.quorum,
    constants.precisionDivider
  );
  const diffReached = isDifferentialReached(
    proposalData.proposalData.forVotes,
    proposalData.proposalData.againstVotes,
    constants.votingConfigs[proposalData.proposalData.accessLevel].config.differential,
    constants.precisionDivider
  );

  const allVotes = new BigNumber(votingMachineData.proposalData.forVotes).plus(
    votingMachineData.proposalData.againstVotes
  );
  const forPercent = allVotes.gt(0)
    ? new BigNumber(votingMachineData.proposalData.forVotes).dividedBy(allVotes).toNumber()
    : 0;
  const forVotes = normalizeBN(votingMachineData.proposalData.forVotes, 18).toNumber();

  const againstPercent = allVotes.gt(0)
    ? new BigNumber(votingMachineData.proposalData.againstVotes).dividedBy(allVotes).toNumber()
    : 0;
  const againstVotes = normalizeBN(votingMachineData.proposalData.againstVotes, 18).toNumber();

  return {
    id: proposalData.id,
    title: proposal.title,
    shortDescription: `${proposal.shortDescription} and then some more stuff this is a long short description it should get cut off in the list view but it is not why is it not getting ellipsed test test why why test test borrow gho`,
    proposalState: proposalData.proposalData.state,
    forVotes,
    againstVotes,
    forPercent,
    againstPercent,
    quorumReached,
    diffReached,
    accessLevel: proposalData.proposalData.accessLevel,
    votingChainId: proposalData.votingChainId,
  };
};
