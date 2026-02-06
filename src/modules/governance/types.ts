import { VotingMachineProposalState } from '@aave/contract-helpers';
import { Proposal } from 'src/hooks/governance/useProposals';
import { ProposalDetail } from 'src/services/GovernanceCacheService';

import { ProposalBadgeState } from './StateBadge';

/**
 * Unified vote statistics for display.
 * forPercent/againstPercent are in 0-1 range (matching VoteBar's InnerBar which does `width: ${percent * 100}%`).
 */
export type ProposalVoteDisplayInfo = {
  forVotes: number;
  againstVotes: number;
  /** 0-1 range */
  forPercent: number;
  /** 0-1 range */
  againstPercent: number;
  quorum: number;
  quorumReached: boolean;
  currentDifferential: number;
  requiredDifferential: number;
  differentialReached: boolean;
};

/**
 * Data-source-agnostic list item for proposals list view.
 */
export type ProposalListItem = {
  id: string;
  title: string;
  shortDescription: string;
  author: string;
  badgeState: ProposalBadgeState;
  voteInfo: ProposalVoteDisplayInfo;
};

/**
 * Data-source-agnostic detail display type.
 * `rawProposal` is present only for the graph path, allowing graph-only features
 * (VoteInfo, ProposalLifecycle) to access raw on-chain data.
 */
export type ProposalDetailDisplay = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  author: string;
  discussions: string | null;
  ipfsHash: string;
  badgeState: ProposalBadgeState;
  voteInfo: ProposalVoteDisplayInfo;
  /** Present only for graph (subgraph) data path. Used by VoteInfo and ProposalLifecycle. */
  rawProposal?: Proposal;
  /** Present only for cache data path. Used by ProposalLifecycleCache. */
  rawCacheDetail?: ProposalDetail;
  /** Voting data derived from either data path. Used by VoteInfo and GovVoteModal. */
  voteProposalData?: VoteProposalData;
};

/**
 * Minimal data needed by VoteInfo and the vote modal flow.
 * Built from either the graph Proposal or the cache ProposalDetail.
 */
export type VoteProposalData = {
  proposalId: string;
  snapshotBlockHash: string;
  votingMachineChainId: number;
  votingAssets: string[];
  votingState: VotingMachineProposalState;
  votedInfo?: {
    support: boolean;
    votingPower: string;
  };
};

/**
 * Normalized vote for display in voter lists.
 * votingPower is a normalized string (not in wei).
 */
export type VoteDisplay = {
  voter: string;
  support: boolean;
  votingPower: string;
  ensName?: string;
};

/**
 * Voters split by yae/nay with a combined sorted list.
 */
export type VotersSplitDisplay = {
  yaeVotes: VoteDisplay[];
  nayVotes: VoteDisplay[];
  combinedVotes: VoteDisplay[];
};
