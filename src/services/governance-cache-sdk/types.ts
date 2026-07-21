/**
 * Domain types returned by the governance cache SDK. These are data-source
 * shapes (camelCase, light normalization) — UI-facing transforms live in
 * src/modules/governance/adapters.ts.
 */

/** List-level proposal data (from `proposals_view` / `searchProposals`). */
export interface SimplifiedProposal {
  id: string;
  creator: string;
  accessLevel: number;
  ipfsHash: string;
  state: string;
  stateId: number;
  title: string;
  shortDescription: string;
  author: string;
  discussions: string | null;
  votesFor: string;
  votesAgainst: string;
  snapshotBlockHash: string | null;
  votingDuration: string | null;
}

/** Full proposal detail (from `getProposalDetail`). */
export interface ProposalDetail {
  id: string;
  network: string;
  creator: string;
  accessLevel: number;
  ipfsHash: string;
  title: string;
  author: string;
  shortDescription: string;
  description: string;
  discussions: string | null;
  snapshotBlockHash: string | null;
  votingDuration: string | null;
  votesFor: string;
  votesAgainst: string;
  state: string;
  stateId: number;
  // Timestamps (ISO 8601)
  createdAt: string | null;
  votingActivatedAt: string | null;
  queuedAt: string | null;
  executedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  // Voting timing (unix seconds)
  votingStartTime: string | null;
  votingEndTime: string | null;
  l1BlockHash: string | null;
  // VotingMachine contract address (identifies the voting chain)
  votingMachineAddress: string | null;
  // Voting thresholds
  quorum: string | null;
  requiredDifferential: string | null;
  // Voting config
  cooldownBeforeVotingStart: number | null;
  // Accurate vote-close time (closeAndSendVote lands after votingEndTime); ISO 8601
  votingClosedAndSentAt: string | null;
  // Lifecycle transaction hashes (for explorer links)
  createdTxHash: string | null;
  votingActivatedTxHash: string | null;
  queuedTxHash: string | null;
  executedTxHash: string | null;
  failedTxHash: string | null;
  cancelledTxHash: string | null;
  votingClosedTxHash: string | null;
}

/** A single vote (from `getProposalVotes` / `getUserVote`). votingPower is wei. */
export interface ProposalVote {
  voter: string;
  support: boolean;
  votingPower: string;
  votingNetwork: string;
  votedAt: string | null;
}

export interface VoteCounts {
  forCount: number;
  againstCount: number;
  totalCount: number;
}

/** A single executable action within a payload (target contract + calldata). */
export interface PayloadAction {
  target: string;
  signature: string | null;
  callData: string | null;
  value: string | null;
  withDelegateCall: boolean;
  accessLevel: number | null;
}

/** A proposal payload across chains (from `getProposalPayloads`). */
export interface ProposalPayload {
  proposalId: string;
  payloadId: number;
  chainId: number;
  network: string;
  payloadsController: string;
  creator: string | null;
  maximumAccessLevelRequired: number | null;
  state: string;
  createdAt: string | null;
  queuedAt: string | null;
  executedAt: string | null;
  cancelledAt: string | null;
  actions: PayloadAction[];
  // Executor timelock config (seconds) + expiry (ISO 8601)
  delaySeconds: number | null;
  gracePeriodSeconds: number | null;
  expirationTime: string | null;
  // Per-lifecycle transaction hashes (for explorer links)
  createdTxHash: string | null;
  queuedTxHash: string | null;
  executedTxHash: string | null;
  cancelledTxHash: string | null;
}

/**
 * Per-access-level voting config (gap field — sourced from the auto-generated
 * VotingConfigUpdated table, not the curated views). `minPropositionPower` is
 * the field the curated `proposals_view` drops; the rest mirror the detail
 * thresholds for completeness.
 */
export interface ProposalVotingConfig {
  accessLevel: number;
  votingDuration: number | null;
  cooldownBeforeVotingStart: number | null;
  /** yesThreshold — same value as ProposalDetail.quorum. */
  yesThreshold: string | null;
  /** yesNoDifferential — same value as ProposalDetail.requiredDifferential. */
  yesNoDifferential: string | null;
  minPropositionPower: string | null;
}

/**
 * Protocol-level governance constants.
 *
 * These are GovernanceCore immutables / view-functions — they are NOT indexed
 * by the cache (no event emits them) and therefore cannot be fetched via any
 * GraphQL query, curated or auto-generated. They must be read on-chain (once,
 * then cached) via GovernanceV3Service / @aave/contract-helpers, or hardcoded
 * per market since they effectively never change. This type is the shared
 * shape for that on-chain seam; see config.ts.
 */
export interface GovernanceConstants {
  precisionDivider: string;
  cooldownPeriod: string;
  expirationTime: string;
  cancellationFee: string;
}
