/**
 * Vote queries — per-proposal votes, a single user's vote, and vote counts.
 * Ports the curated `getProposalVotes` / `getUserVote` endpoints plus the
 * `allProposalVotesViews` count aggregation.
 */
import { gql, request, RequestOptions } from './client';
import { ProposalVote, VoteCounts } from './types';

interface VoteNode {
  voter: string;
  support: boolean;
  votingPower: string;
  votingNetwork: string;
  votedAt: string | null;
}

const VOTE_FIELDS = `
  voter
  support
  votingPower
  votingNetwork
  votedAt
`;

const GET_PROPOSAL_VOTES = gql`
  query GetProposalVotes($proposalId: String!, $support: Boolean, $limit: Int, $offset: Int) {
    getProposalVotes(
      pProposalId: $proposalId
      pSupport: $support
      limitCount: $limit
      offsetCount: $offset
    ) {
      nodes { ${VOTE_FIELDS} }
    }
  }
`;

const GET_USER_VOTE = gql`
  query GetUserVote($proposalId: String!, $voter: String!) {
    getUserVote(pProposalId: $proposalId, pVoter: $voter) {
      nodes { ${VOTE_FIELDS} }
    }
  }
`;

const GET_VOTE_COUNTS = gql`
  query GetVoteCounts($proposalId: String!) {
    forVotes: allProposalVotesViews(
      filter: { proposalId: { equalTo: $proposalId }, support: { equalTo: true } }
    ) {
      totalCount
    }
    againstVotes: allProposalVotesViews(
      filter: { proposalId: { equalTo: $proposalId }, support: { equalTo: false } }
    ) {
      totalCount
    }
  }
`;

function mapVote(v: VoteNode): ProposalVote {
  return {
    voter: v.voter,
    support: v.support,
    votingPower: v.votingPower,
    votingNetwork: v.votingNetwork,
    votedAt: v.votedAt,
  };
}

/** Paginated votes for a proposal, optionally filtered by support direction. */
export async function getProposalVotes(
  proposalId: string,
  support?: boolean,
  limit = 100,
  offset = 0,
  options?: RequestOptions
): Promise<ProposalVote[]> {
  const data = await request<{ getProposalVotes: { nodes: VoteNode[] } }>(
    GET_PROPOSAL_VOTES,
    { proposalId, support: support ?? null, limit, offset },
    options
  );
  return data.getProposalVotes.nodes.map(mapVote);
}

/** A single user's vote on a proposal, or null if they did not vote. */
export async function getUserVote(
  proposalId: string,
  voter: string,
  options?: RequestOptions
): Promise<ProposalVote | null> {
  const data = await request<{ getUserVote: { nodes: VoteNode[] } }>(
    GET_USER_VOTE,
    { proposalId, voter },
    options
  );
  const nodes = data.getUserVote.nodes;
  if (nodes.length === 0) return null;
  return mapVote(nodes[0]);
}

/** For / against / total vote counts for a proposal. */
export async function getVoteCounts(
  proposalId: string,
  options?: RequestOptions
): Promise<VoteCounts> {
  const data = await request<{
    forVotes: { totalCount: number };
    againstVotes: { totalCount: number };
  }>(GET_VOTE_COUNTS, { proposalId }, options);

  const forCount = data.forVotes.totalCount;
  const againstCount = data.againstVotes.totalCount;
  return { forCount, againstCount, totalCount: forCount + againstCount };
}
