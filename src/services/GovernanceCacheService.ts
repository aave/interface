/**
 * @deprecated Back-compat shim.
 *
 * The governance cache fetching layer now lives in `./governance-cache-sdk`.
 * Import from there for new code:
 *   import { getProposals, getProposalDetail } from 'src/services/governance-cache-sdk';
 *
 * This file re-exports the SDK under the legacy `*FromCache` names so existing
 * call sites keep working. Migrate imports, then delete this shim.
 */
export type {
  PayloadAction,
  ProposalDetail,
  ProposalPayload,
  ProposalVote,
  SimplifiedProposal,
} from './governance-cache-sdk';
export {
  getProposalById as getProposalByIdFromCache,
  getProposalDetail as getProposalDetailFromCache,
  getProposalPayloads as getProposalPayloadsFromCache,
  getProposals as getProposalsFromCache,
  getVoteCounts as getProposalVoteCountsFromCache,
  getProposalVotes as getProposalVotesFromCache,
  getUserVote as getUserVoteFromCache,
  searchProposals as searchProposalsFromCache,
} from './governance-cache-sdk';
