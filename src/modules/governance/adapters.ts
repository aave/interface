import { VotingMachineProposalState } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import { constants } from 'ethers';
import { Proposal } from 'src/hooks/governance/useProposals';
import {
  ProposalDetail,
  ProposalVote,
  SimplifiedProposal,
} from 'src/services/GovernanceCacheService';
import { governanceV3Config } from 'src/ui-config/governanceConfig';

import { ProposalBadgeState } from './StateBadge';
import {
  ProposalDetailDisplay,
  ProposalListItem,
  ProposalVoteDisplayInfo,
  VoteDisplay,
  VoteProposalData,
} from './types';

// ============================================
// Cache state -> badge mapping (replaces mapStateToBadge duplicated in 3 cache files)
// ============================================

export function cacheStateToBadge(state: string): ProposalBadgeState {
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

// ============================================
// Vote calculation helpers
// ============================================

/** Convert 18-decimal vote count string to human-readable number */
function formatVotes(votes: string): number {
  return normalizeBN(votes || '0', 18).toNumber();
}

/**
 * Calculate unified vote display info from raw cache vote strings.
 * Returns percentages in 0-1 range (matching VoteBar expectations).
 */
export function calculateCacheVoteDisplayInfo(
  votesFor: string,
  votesAgainst: string,
  quorum: string | null,
  requiredDifferential: string | null
): ProposalVoteDisplayInfo {
  const forVotes = formatVotes(votesFor);
  const againstVotes = formatVotes(votesAgainst);
  const total = forVotes + againstVotes;

  // Quorum is stored in whole token units (e.g., 320000 = 320K tokens)
  const quorumValue = quorum ? parseFloat(quorum) : 0;
  const differentialValue = requiredDifferential ? parseFloat(requiredDifferential) : 0;
  const currentDifferential = forVotes - againstVotes;

  return {
    forVotes,
    againstVotes,
    // 0-1 range for VoteBar
    forPercent: total > 0 ? forVotes / total : 0,
    againstPercent: total > 0 ? againstVotes / total : 0,
    quorum: quorumValue,
    quorumReached: forVotes >= quorumValue,
    currentDifferential,
    requiredDifferential: differentialValue,
    differentialReached: currentDifferential >= differentialValue,
  };
}

// ============================================
// VoteProposalData builders
// ============================================

/**
 * Parse rindexer FixedBytes format into a clean hex string.
 * e.g. "FixedBytes(0xabc123..., 32)" → "0xabc123..."
 */
function parseFixedBytes(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/FixedBytes\((0x[a-fA-F0-9]+)/);
  return match ? match[1] : raw;
}

/** Map a VotingMachine contract address to its chain ID via governance config. */
function votingMachineAddressToChainId(address: string): number | undefined {
  const lowerAddress = address.toLowerCase();
  for (const [chainId, config] of Object.entries(governanceV3Config.votingChainConfig)) {
    if (config.votingMachineAddress.toLowerCase() === lowerAddress) {
      return Number(chainId);
    }
  }
  return undefined;
}

/** Build VoteProposalData from a graph Proposal. */
export function buildVoteProposalFromGraph(proposal: Proposal): VoteProposalData {
  const votedInfo = proposal.votingMachineData.votedInfo;
  return {
    proposalId: proposal.subgraphProposal.id,
    snapshotBlockHash: proposal.subgraphProposal.snapshotBlockHash,
    votingMachineChainId: +proposal.subgraphProposal.votingPortal.votingMachineChainId,
    votingAssets: proposal.votingMachineData.votingAssets,
    votingState: proposal.votingMachineData.state,
    votedInfo:
      votedInfo && votedInfo.votingPower !== '0'
        ? { support: votedInfo.support, votingPower: votedInfo.votingPower }
        : undefined,
  };
}

/** Build VoteProposalData from a cache ProposalDetail. Returns undefined if voting chain can't be determined. */
export function buildVoteProposalFromCache(detail: ProposalDetail): VoteProposalData | undefined {
  if (!detail.votingMachineAddress) return undefined;

  const votingMachineChainId = votingMachineAddressToChainId(detail.votingMachineAddress);
  if (votingMachineChainId === undefined) return undefined;

  const { aaveTokenAddress, aAaveTokenAddress, stkAaveTokenAddress } =
    governanceV3Config.votingAssets;

  return {
    proposalId: detail.id,
    snapshotBlockHash: parseFixedBytes(detail.snapshotBlockHash) || constants.HashZero,
    votingMachineChainId,
    votingAssets: [aaveTokenAddress, aAaveTokenAddress, stkAaveTokenAddress],
    votingState:
      detail.state === 'active'
        ? VotingMachineProposalState.Active
        : VotingMachineProposalState.Finished,
    // votedInfo not available from cache — user's on-chain vote status is unknown
  };
}

// ============================================
// Graph -> canonical adapters
// ============================================

export function adaptGraphProposalToListItem(p: Proposal): ProposalListItem {
  return {
    id: p.subgraphProposal.id,
    title: p.subgraphProposal.proposalMetadata.title,
    shortDescription: p.subgraphProposal.proposalMetadata.shortDescription || '',
    author: p.subgraphProposal.proposalMetadata.author || '',
    badgeState: p.badgeState,
    voteInfo: {
      forVotes: p.votingInfo.forVotes,
      againstVotes: p.votingInfo.againstVotes,
      forPercent: p.votingInfo.forPercent,
      againstPercent: p.votingInfo.againstPercent,
      quorum:
        typeof p.votingInfo.quorum === 'string'
          ? parseFloat(p.votingInfo.quorum)
          : p.votingInfo.quorum,
      quorumReached: p.votingInfo.quorumReached,
      currentDifferential:
        typeof p.votingInfo.currentDifferential === 'string'
          ? parseFloat(p.votingInfo.currentDifferential)
          : p.votingInfo.currentDifferential,
      requiredDifferential:
        typeof p.votingInfo.requiredDifferential === 'string'
          ? parseFloat(p.votingInfo.requiredDifferential)
          : p.votingInfo.requiredDifferential,
      differentialReached: p.votingInfo.differentialReached,
    },
  };
}

export function adaptGraphProposalToDetail(p: Proposal): ProposalDetailDisplay {
  const listItem = adaptGraphProposalToListItem(p);
  return {
    ...listItem,
    description: p.subgraphProposal.proposalMetadata.description,
    discussions: p.subgraphProposal.proposalMetadata.discussions || null,
    ipfsHash: p.subgraphProposal.proposalMetadata.ipfsHash,
    rawProposal: p,
    voteProposalData: buildVoteProposalFromGraph(p),
  };
}

// ============================================
// Cache -> canonical adapters
// ============================================

export function adaptCacheProposalToListItem(p: SimplifiedProposal): ProposalListItem {
  const voteInfo = calculateCacheVoteDisplayInfo(p.votesFor, p.votesAgainst, null, null);
  return {
    id: p.id,
    title: p.title,
    shortDescription: p.shortDescription,
    author: p.author,
    badgeState: cacheStateToBadge(p.state),
    voteInfo,
  };
}

export function adaptCacheProposalToDetail(p: ProposalDetail): ProposalDetailDisplay {
  const voteInfo = calculateCacheVoteDisplayInfo(
    p.votesFor,
    p.votesAgainst,
    p.quorum,
    p.requiredDifferential
  );
  return {
    id: p.id,
    title: p.title,
    shortDescription: p.shortDescription,
    description: p.description,
    author: p.author,
    discussions: p.discussions,
    ipfsHash: p.ipfsHash,
    badgeState: cacheStateToBadge(p.state),
    voteInfo,
    rawCacheDetail: p,
    voteProposalData: buildVoteProposalFromCache(p),
  };
}

// ============================================
// Vote adapters
// ============================================

/** Adapt cache vote (votingPower in wei/18 decimals) to normalized VoteDisplay */
export function adaptCacheVote(vote: ProposalVote): VoteDisplay {
  return {
    voter: vote.voter,
    support: vote.support,
    votingPower: normalizeBN(vote.votingPower, 18).toString(),
  };
}
