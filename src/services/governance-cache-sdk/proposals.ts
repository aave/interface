/**
 * Proposal queries — list, search, by-id, and full detail.
 * Ports the curated `allProposalsViews`, `searchProposals`, and
 * `getProposalDetail` endpoints.
 */
import { gql, request, RequestOptions } from './client';
import { ProposalDetail, SimplifiedProposal } from './types';

interface CacheProposalNode {
  proposalId: number | string;
  network: string;
  creator: string;
  accessLevel: number;
  ipfsHash: string;
  title: string | null;
  author: string | null;
  shortDescription: string | null;
  description?: string | null;
  discussions: string | null;
  snapshotBlockHash: string | null;
  votingDuration: string | null;
  votesFor: string;
  votesAgainst: string;
  state: string;
  stateId: number;
}

function mapCacheProposal(p: CacheProposalNode): SimplifiedProposal {
  const id = String(p.proposalId);
  return {
    id,
    creator: p.creator,
    accessLevel: p.accessLevel,
    ipfsHash: p.ipfsHash,
    state: p.state,
    stateId: p.stateId,
    title: p.title || `Proposal ${id}`,
    shortDescription: p.shortDescription || '',
    author: p.author || '',
    discussions: p.discussions,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    snapshotBlockHash: p.snapshotBlockHash,
    votingDuration: p.votingDuration,
  };
}

const PROPOSALS_FIELDS = `
  proposalId
  network
  creator
  accessLevel
  ipfsHash
  title
  author
  shortDescription
  discussions
  snapshotBlockHash
  votingDuration
  votesFor
  votesAgainst
  state
  stateId
`;

const GET_PROPOSALS = gql`
  query GetProposals($first: Int, $offset: Int) {
    allProposalsViews(first: $first, offset: $offset, orderBy: PROPOSAL_ID_DESC) {
      nodes { ${PROPOSALS_FIELDS} }
    }
  }
`;

const GET_PROPOSALS_FILTERED = gql`
  query GetProposalsFiltered($first: Int, $offset: Int, $state: String!) {
    allProposalsViews(
      first: $first
      offset: $offset
      orderBy: PROPOSAL_ID_DESC
      filter: { state: { equalTo: $state } }
    ) {
      nodes { ${PROPOSALS_FIELDS} }
    }
  }
`;

const SEARCH_PROPOSALS = gql`
  query SearchProposals($searchQuery: String!, $limit: Int) {
    searchProposals(searchQuery: $searchQuery, limitCount: $limit) {
      nodes {
        proposalId
        network
        title
        author
        shortDescription
        state
        stateId
        votesFor
        votesAgainst
        creator
      }
    }
  }
`;

const GET_PROPOSAL_BY_ID = gql`
  query GetProposalById($id: BigFloat!) {
    allProposalsViews(filter: { proposalId: { equalTo: $id } }) {
      nodes {
        proposalId
        network
        creator
        accessLevel
        ipfsHash
        title
        author
        shortDescription
        description
        discussions
        snapshotBlockHash
        votingDuration
        votesFor
        votesAgainst
        state
        stateId
      }
    }
  }
`;

const GET_PROPOSAL_DETAIL = gql`
  query GetProposalDetail($id: String!) {
    getProposalDetail(pProposalId: $id) {
      nodes {
        proposalId
        network
        creator
        accessLevel
        ipfsHash
        title
        author
        shortDescription
        description
        discussions
        snapshotBlockHash
        votingDuration
        votesFor
        votesAgainst
        state
        stateId
        createdAt
        votingActivatedAt
        queuedAt
        executedAt
        failedAt
        cancelledAt
        votingStartTime
        votingEndTime
        l1BlockHash
        votingMachineAddress
        quorum
        requiredDifferential
        coolDownBeforeVotingStart
        votingClosedAndSentAt
        createdTxHash
        votingActivatedTxHash
        queuedTxHash
        executedTxHash
        failedTxHash
        cancelledTxHash
        votingClosedTxHash
      }
    }
  }
`;

type NodesResponse<T> = { allProposalsViews: { nodes: T[] } };

/** Paginated proposals list, optionally filtered by state. */
export async function getProposals(
  limit = 10,
  offset = 0,
  stateFilter?: string,
  options?: RequestOptions
): Promise<SimplifiedProposal[]> {
  const query = stateFilter ? GET_PROPOSALS_FILTERED : GET_PROPOSALS;
  const variables: Record<string, unknown> = { first: limit, offset };
  if (stateFilter) variables.state = stateFilter;

  const data = await request<NodesResponse<CacheProposalNode>>(query, variables, options);
  return data.allProposalsViews.nodes.map(mapCacheProposal);
}

/** Full-text proposal search. */
export async function searchProposals(
  searchQuery: string,
  limit = 10,
  options?: RequestOptions
): Promise<SimplifiedProposal[]> {
  const data = await request<{ searchProposals: { nodes: CacheProposalNode[] } }>(
    SEARCH_PROPOSALS,
    { searchQuery, limit },
    options
  );

  return data.searchProposals.nodes.map((p) => {
    const id = String(p.proposalId);
    return {
      id,
      creator: p.creator || '',
      accessLevel: 0,
      ipfsHash: '',
      state: p.state,
      stateId: p.stateId,
      title: p.title || `Proposal ${id}`,
      shortDescription: p.shortDescription || '',
      author: p.author || '',
      discussions: null,
      votesFor: p.votesFor,
      votesAgainst: p.votesAgainst,
      snapshotBlockHash: null,
      votingDuration: null,
    };
  });
}

/** Single proposal (list-level shape) by id. */
export async function getProposalById(
  id: string,
  options?: RequestOptions
): Promise<SimplifiedProposal | null> {
  const data = await request<NodesResponse<CacheProposalNode>>(
    GET_PROPOSAL_BY_ID,
    { id: parseFloat(id) },
    options
  );
  const nodes = data.allProposalsViews.nodes;
  if (nodes.length === 0) return null;
  return mapCacheProposal(nodes[0]);
}

interface ProposalDetailNode extends CacheProposalNode {
  description: string | null;
  createdAt: string | null;
  votingActivatedAt: string | null;
  queuedAt: string | null;
  executedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  votingStartTime: string | null;
  votingEndTime: string | null;
  l1BlockHash: string | null;
  votingMachineAddress: string | null;
  quorum: string | null;
  requiredDifferential: string | null;
  coolDownBeforeVotingStart: number | null;
  votingClosedAndSentAt: string | null;
  createdTxHash: string | null;
  votingActivatedTxHash: string | null;
  queuedTxHash: string | null;
  executedTxHash: string | null;
  failedTxHash: string | null;
  cancelledTxHash: string | null;
  votingClosedTxHash: string | null;
}

/** Full proposal detail including timestamps and thresholds. */
export async function getProposalDetail(
  id: string,
  options?: RequestOptions
): Promise<ProposalDetail | null> {
  const data = await request<{ getProposalDetail: { nodes: ProposalDetailNode[] } }>(
    GET_PROPOSAL_DETAIL,
    { id },
    options
  );
  const nodes = data.getProposalDetail.nodes;
  if (nodes.length === 0) return null;

  const p = nodes[0];
  return {
    id: String(p.proposalId),
    network: p.network,
    creator: p.creator,
    accessLevel: p.accessLevel,
    ipfsHash: p.ipfsHash,
    title: p.title || `Proposal ${p.proposalId}`,
    author: p.author || '',
    shortDescription: p.shortDescription || '',
    description: p.description || '',
    discussions: p.discussions,
    snapshotBlockHash: p.snapshotBlockHash,
    votingDuration: p.votingDuration,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    state: p.state,
    stateId: p.stateId,
    createdAt: p.createdAt,
    votingActivatedAt: p.votingActivatedAt,
    queuedAt: p.queuedAt,
    executedAt: p.executedAt,
    failedAt: p.failedAt,
    cancelledAt: p.cancelledAt,
    votingStartTime: p.votingStartTime,
    votingEndTime: p.votingEndTime,
    l1BlockHash: p.l1BlockHash,
    votingMachineAddress: p.votingMachineAddress,
    quorum: p.quorum,
    requiredDifferential: p.requiredDifferential,
    cooldownBeforeVotingStart: p.coolDownBeforeVotingStart ?? null,
    votingClosedAndSentAt: p.votingClosedAndSentAt,
    createdTxHash: p.createdTxHash,
    votingActivatedTxHash: p.votingActivatedTxHash,
    queuedTxHash: p.queuedTxHash,
    executedTxHash: p.executedTxHash,
    failedTxHash: p.failedTxHash,
    cancelledTxHash: p.cancelledTxHash,
    votingClosedTxHash: p.votingClosedTxHash,
  };
}
