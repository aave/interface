/**
 * Service to fetch governance data from the local governancecache
 * instead of the subgraph
 */

import { networkConfigs } from 'src/ui-config/networksConfig';

const CACHE_ENDPOINT =
  process.env.NEXT_PUBLIC_GOVERNANCE_CACHE_URL || 'http://localhost:3002/graphql';

interface CacheProposal {
  proposalId: number | string;
  network: string;
  creator: string;
  accessLevel: number;
  ipfsHash: string;
  title: string | null;
  author: string | null;
  shortDescription: string | null;
  description: string | null;
  discussions: string | null;
  snapshotBlockHash: string | null;
  votingDuration: string | null;
  votesFor: string;
  votesAgainst: string;
  state: string;
  stateId: number;
}

interface ProposalsViewResponse {
  data: {
    allProposalsViews: {
      nodes: CacheProposal[];
    };
  };
}

interface SearchResponse {
  data: {
    searchProposals: {
      nodes: CacheProposal[];
    };
  };
}

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

async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(CACHE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    const first = json.errors[0];
    throw new Error(`GraphQL error: ${first.message}`);
  }

  return json as T;
}

function mapCacheProposal(p: CacheProposal): SimplifiedProposal {
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

const GET_PROPOSALS_QUERY = `
  query GetProposals($first: Int, $offset: Int) {
    allProposalsViews(first: $first, offset: $offset, orderBy: PROPOSAL_ID_DESC) {
      nodes { ${PROPOSALS_FIELDS} }
    }
  }
`;

const GET_PROPOSALS_FILTERED_QUERY = `
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

export async function getProposalsFromCache(
  limit = 10,
  offset = 0,
  stateFilter?: string
): Promise<SimplifiedProposal[]> {
  const query = stateFilter ? GET_PROPOSALS_FILTERED_QUERY : GET_PROPOSALS_QUERY;
  const variables: Record<string, unknown> = { first: limit, offset };
  if (stateFilter) variables.state = stateFilter;

  const response = await graphqlRequest<ProposalsViewResponse>(query, variables);
  return response.data.allProposalsViews.nodes.map(mapCacheProposal);
}

export async function searchProposalsFromCache(
  searchQuery: string,
  limit = 10
): Promise<SimplifiedProposal[]> {
  const query = `
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

  const response = await graphqlRequest<SearchResponse>(query, {
    searchQuery,
    limit,
  });

  return response.data.searchProposals.nodes.map((p) => {
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

export async function getProposalByIdFromCache(id: string): Promise<SimplifiedProposal | null> {
  const query = `
    query GetProposal($id: BigFloat!) {
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

  const response = await graphqlRequest<ProposalsViewResponse>(query, { id: parseFloat(id) });
  const nodes = response.data.allProposalsViews.nodes;

  if (nodes.length === 0) return null;
  return mapCacheProposal(nodes[0]);
}

// ============================================
// DETAIL PAGE TYPES AND FUNCTIONS
// ============================================

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
  // Timestamps
  createdAt: string | null;
  votingActivatedAt: string | null;
  queuedAt: string | null;
  executedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  // Voting timing (unix timestamps)
  votingStartTime: string | null;
  votingEndTime: string | null;
  l1BlockHash: string | null;
  // VotingMachine contract address (identifies the voting chain)
  votingMachineAddress: string | null;
  // Voting thresholds
  quorum: string | null;
  requiredDifferential: string | null;
}

export interface ProposalVote {
  voter: string;
  support: boolean;
  votingPower: string;
  votingNetwork: string;
  votedAt: string | null;
}

interface ProposalDetailResponse {
  data: {
    getProposalDetail: {
      nodes: Array<{
        proposalId: number | string;
        network: string;
        creator: string;
        accessLevel: number;
        ipfsHash: string;
        title: string | null;
        author: string | null;
        shortDescription: string | null;
        description: string | null;
        discussions: string | null;
        snapshotBlockHash: string | null;
        votingDuration: string | null;
        votesFor: string;
        votesAgainst: string;
        state: string;
        stateId: number;
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
      }>;
    };
  };
}

interface ProposalVotesResponse {
  data: {
    getProposalVotes: {
      nodes: Array<{
        voter: string;
        support: boolean;
        votingPower: string;
        votingNetwork: string;
        votedAt: string | null;
      }>;
    };
  };
}

export async function getProposalDetailFromCache(id: string): Promise<ProposalDetail | null> {
  const query = `
    query GetProposalDetail($id: BigFloat!) {
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
        }
      }
    }
  `;

  const response = await graphqlRequest<ProposalDetailResponse>(query, { id: parseFloat(id) });
  const nodes = response.data.getProposalDetail.nodes;

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
  };
}

export async function getProposalVotesFromCache(
  proposalId: string,
  support?: boolean,
  limit = 100,
  offset = 0
): Promise<ProposalVote[]> {
  const query = `
    query GetProposalVotes($proposalId: BigFloat!, $support: Boolean, $limit: Int, $offset: Int) {
      getProposalVotes(
        pProposalId: $proposalId,
        pSupport: $support,
        limitCount: $limit,
        offsetCount: $offset
      ) {
        nodes {
          voter
          support
          votingPower
          votingNetwork
          votedAt
        }
      }
    }
  `;

  const response = await graphqlRequest<ProposalVotesResponse>(query, {
    proposalId: parseFloat(proposalId),
    support: support ?? null,
    limit,
    offset,
  });

  return response.data.getProposalVotes.nodes.map((v) => ({
    voter: v.voter,
    support: v.support,
    votingPower: v.votingPower,
    votingNetwork: v.votingNetwork,
    votedAt: v.votedAt,
  }));
}

export async function getProposalVoteCountsFromCache(
  proposalId: string
): Promise<{ forCount: number; againstCount: number; totalCount: number }> {
  const query = `
    query GetVoteCounts($proposalId: BigFloat!) {
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

  const response = await graphqlRequest<{
    data: {
      forVotes: { totalCount: number };
      againstVotes: { totalCount: number };
    };
  }>(query, { proposalId: parseFloat(proposalId) });

  const forCount = response.data.forVotes.totalCount;
  const againstCount = response.data.againstVotes.totalCount;

  return {
    forCount,
    againstCount,
    totalCount: forCount + againstCount,
  };
}

// ============================================
// PAYLOAD TYPES AND FUNCTIONS
// ============================================

export interface ProposalPayload {
  proposalId: string;
  payloadId: number;
  chainId: number;
  network: string;
  payloadsController: string;
  creator: string | null;
  maximumAccessLevel: number | null;
  state: string;
  createdAt: string | null;
  queuedAt: string | null;
  executedAt: string | null;
  cancelledAt: string | null;
}

interface ProposalPayloadsResponse {
  data: {
    getProposalPayloads: {
      nodes: Array<{
        proposalId: string;
        payloadId: number;
        chainId: number;
        payloadsController: string;
        creator: string | null;
        maximumAccessLevel: number | null;
        state: string | null;
        createdAt: string | null;
        queuedAt: string | null;
        executedAt: string | null;
        cancelledAt: string | null;
      }>;
    };
  };
}

export async function getProposalPayloadsFromCache(proposalId: string): Promise<ProposalPayload[]> {
  const query = `
    query GetProposalPayloads($proposalId: BigFloat!) {
      getProposalPayloads(pProposalId: $proposalId) {
        nodes {
          proposalId
          payloadId
          chainId
          payloadsController
          creator
          maximumAccessLevel
          state
          createdAt
          queuedAt
          executedAt
          cancelledAt
        }
      }
    }
  `;

  const response = await graphqlRequest<ProposalPayloadsResponse>(query, {
    proposalId: parseFloat(proposalId),
  });

  return response.data.getProposalPayloads.nodes.map((p) => ({
    proposalId: p.proposalId,
    payloadId: p.payloadId,
    chainId: p.chainId,
    network: networkConfigs[p.chainId as keyof typeof networkConfigs]?.name || `Chain ${p.chainId}`,
    payloadsController: p.payloadsController,
    creator: p.creator,
    maximumAccessLevel: p.maximumAccessLevel,
    state: p.state || 'created',
    createdAt: p.createdAt,
    queuedAt: p.queuedAt,
    executedAt: p.executedAt,
    cancelledAt: p.cancelledAt,
  }));
}
