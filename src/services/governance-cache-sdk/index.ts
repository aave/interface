/**
 * Governance cache SDK — typed fetching layer over the governance-v3-cache
 * GraphQL server (curated endpoints + the auto-generated/derived gap fields
 * needed to fully replace the governance subgraph).
 *
 * Public surface. Prefer importing from here:
 *   import { getProposals, getProposalDetail } from 'src/services/governance-cache-sdk';
 */

// Transport
export type { GraphQLError, RequestOptions } from './client';
export { CACHE_ENDPOINT, GovernanceCacheError, request } from './client';

// Types
export * from './types';

// Proposals
export { getProposalById, getProposalDetail, getProposals, searchProposals } from './proposals';

// Votes
export { getProposalVotes, getUserVote, getVoteCounts } from './votes';

// Payloads
export { getProposalPayloads } from './payloads';

// Config / gap closers
export { getProposalVotingConfig, resolveVotingChainId } from './config';
