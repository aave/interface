/**
 * Governance config — the "gap closers" that let the cache fully replace the
 * subgraph. The subgraph exposed three things the curated cache views drop:
 *
 *   A. minPropositionPower / voting config  -> available via the auto-generated
 *      VotingConfigUpdated table (this file).
 *   B. votingMachineChainId                 -> derivable from the voting machine
 *      address already returned by getProposalDetail (this file).
 *   C. constants (precisionDivider,         -> NOT indexed by the cache (they are
 *      cooldownPeriod, expirationTime)         GovernanceCore immutables / view
 *                                              functions, never emitted as events).
 *                                              Must be read on-chain — see below.
 */
import { governanceV3Config } from 'src/ui-config/governanceConfig';

import { gql, request, RequestOptions } from './client';
import { GovernanceConstants, ProposalVotingConfig } from './types';

// ---------------------------------------------------------------------------
// Bucket A — voting config from the auto-generated VotingConfigUpdated table
// ---------------------------------------------------------------------------

interface VotingConfigNode {
  accessLevel: number;
  votingDuration: number | null;
  coolDownBeforeVotingStart: number | null;
  yesThreshold: string | null;
  yesNoDifferential: string | null;
  minPropositionPower: string | null;
}

/**
 * Hits the rindexer auto-generated table query (not a curated endpoint).
 * Query name and `BLOCK_NUMBER_DESC` ordering verified against the live schema
 * (governance-cache-api.aave.com). Note the table query is NOT schema-prefixed.
 *
 * VotingConfigUpdated is emitted per accessLevel (not per proposal) and can be
 * updated over time, so we filter by accessLevel and take the most recent.
 */
const GET_VOTING_CONFIG = gql`
  query GetVotingConfig($accessLevel: Int!) {
    allVotingConfigUpdateds(
      filter: { accessLevel: { equalTo: $accessLevel } }
      orderBy: BLOCK_NUMBER_DESC
      first: 1
    ) {
      nodes {
        accessLevel
        votingDuration
        coolDownBeforeVotingStart
        yesThreshold
        yesNoDifferential
        minPropositionPower
      }
    }
  }
`;

/**
 * Latest voting config for a given access level. The proposal's `accessLevel`
 * comes from {@link getProposalDetail}. Returns null if no config event has
 * been indexed for that level.
 */
export async function getProposalVotingConfig(
  accessLevel: number,
  options?: RequestOptions
): Promise<ProposalVotingConfig | null> {
  const data = await request<{
    allVotingConfigUpdateds: { nodes: VotingConfigNode[] };
  }>(GET_VOTING_CONFIG, { accessLevel }, options);

  const node = data.allVotingConfigUpdateds.nodes[0];
  if (!node) return null;

  return {
    accessLevel: node.accessLevel,
    votingDuration: node.votingDuration,
    cooldownBeforeVotingStart: node.coolDownBeforeVotingStart,
    yesThreshold: node.yesThreshold,
    yesNoDifferential: node.yesNoDifferential,
    minPropositionPower: node.minPropositionPower,
  };
}

// ---------------------------------------------------------------------------
// Bucket B — votingMachineChainId derived from the voting machine address
// ---------------------------------------------------------------------------

/**
 * Resolve the voting chain id from a voting machine address (e.g.
 * `ProposalDetail.votingMachineAddress`). The subgraph exposed this as
 * `votingPortal.votingMachineChainId`; here we map it from config — no fetch.
 * Returns null if the address doesn't match any configured voting chain.
 */
export function resolveVotingChainId(votingMachineAddress: string | null): number | null {
  if (!votingMachineAddress) return null;
  const target = votingMachineAddress.toLowerCase();
  for (const [chainId, cfg] of Object.entries(governanceV3Config.votingChainConfig)) {
    if (cfg.votingMachineAddress.toLowerCase() === target) {
      return Number(chainId);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Bucket C — protocol constants (on-chain only, not in the cache)
// ---------------------------------------------------------------------------

/**
 * Protocol constants are GovernanceCore immutables and are NOT obtainable from
 * the cache (no event emits them). They must be sourced on-chain — read once
 * via GovernanceV3Service / @aave/contract-helpers and cached, or treated as
 * static config per market since they effectively never change:
 *
 *   precisionDivider -> GovernanceCore.PRECISION_DIVIDER()
 *   cooldownPeriod   -> GovernanceCore.COOLDOWN_PERIOD()
 *   expirationTime   -> GovernanceCore.PROPOSAL_EXPIRATION_TIME()
 *   cancellationFee  -> GovernanceCore.getCancellationFee()
 *
 * This re-export marks the seam; the on-chain reader is intentionally out of
 * scope for the GraphQL fetching layer.
 */
export type { GovernanceConstants };
