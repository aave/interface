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
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { NoSearchResults } from 'src/components/NoSearchResults';
import {
  SubgraphProposal,
  useGetProposalCount,
  useGetProposalsData,
  useGetVotingConfig,
  useGetVotingMachineProposalsData,
  useProposals,
} from 'src/hooks/governance/useProposals';

import { isDifferentialReached, isQuorumReached } from './helpers';
import { ProposalListHeader } from './ProposalListHeader';
import { ProposalV3ListItem } from './ProposalV3ListItem';

const LIMIT = 10;
export const ProposalsV3List = () => {
  const [proposalFilter, setProposalFilter] = useState<string>('all');

  const { data: totalCount } = useGetProposalCount();

  const { data, isFetching: loadingProposals } = useProposals({
    first: LIMIT,
    skip: 0,
    totalCount,
  });

  const toId = data?.[data.length - 1]?.proposalId ?? 0;
  const fromId = data?.[0]?.proposalId ?? 0;

  console.log(toId, fromId);

  const { data: proposalData, isFetching: fetchingProposals } = useGetProposalsData({
    fromId: +fromId,
    toId: +toId,
    limit: LIMIT,
  });
  console.log(proposalData, fetchingProposals);

  const { data: config } = useGetVotingConfig();
  console.log(config, 'config');

  const { data: votingMachingData } = useGetVotingMachineProposalsData(
    proposalData?.map((p) => ({
      id: +p.id,
      snapshotBlockHash: p.proposalData.snapshotBlockHash,
    })) ?? []
  );

  console.log(votingMachingData);

  const handleLoadMore = () => console.log('todo');

  let formattedProposals: FormattedProposal[] = [];
  if (data && proposalData && config && votingMachingData) {
    formattedProposals = data.map<FormattedProposal>((proposal, index) =>
      formatProposal(proposal, proposalData[index], config, votingMachingData[index])
    );
  }

  return (
    <Paper>
      <ProposalListHeader
        proposalFilter={proposalFilter}
        handleProposalFilterChange={setProposalFilter}
        handleSearchQueryChange={(value: string) => console.log(value)}
      />
      {loadingProposals && <LinearProgress />}
      {formattedProposals?.length ? (
        <InfiniteScroll pageStart={1} loadMore={handleLoadMore} hasMore={false}>
          {formattedProposals.map((proposal) => (
            <ProposalV3ListItem key={proposal.id} {...proposal} />
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
  proposalState: ProposalV3State;
  accessLevel: AccessLevel;
  forVotes: number;
  againstVotes: number;
  forPercent: number;
  againstPercent: number;
  quorumReached: boolean;
  diffReached: boolean;
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
    proposalState: proposalData.proposalData.state,
    forVotes,
    againstVotes,
    forPercent,
    againstPercent,
    quorumReached,
    diffReached,
    accessLevel: proposalData.proposalData.accessLevel,
  };
};
