/**
 * Payload queries — payloads for a proposal across chains.
 * Ports the curated `getProposalPayloads` endpoint.
 */
import { networkConfigs } from 'src/ui-config/networksConfig';

import { gql, request, RequestOptions } from './client';
import { ProposalPayload } from './types';

interface PayloadNode {
  proposalId: string;
  payloadId: number;
  chainId: number;
  payloadsController: string;
  creator: string | null;
  maximumAccessLevelRequired: number | null;
  state: string | null;
  createdAt: string | null;
  queuedAt: string | null;
  executedAt: string | null;
  cancelledAt: string | null;
}

const GET_PROPOSAL_PAYLOADS = gql`
  query GetProposalPayloads($proposalId: String!) {
    getProposalPayloads(pProposalId: $proposalId) {
      nodes {
        proposalId
        payloadId
        chainId
        payloadsController
        creator
        maximumAccessLevelRequired
        state
        createdAt
        queuedAt
        executedAt
        cancelledAt
      }
    }
  }
`;

/** All payloads for a proposal, with human-readable network names. */
export async function getProposalPayloads(
  proposalId: string,
  options?: RequestOptions
): Promise<ProposalPayload[]> {
  const data = await request<{ getProposalPayloads: { nodes: PayloadNode[] } }>(
    GET_PROPOSAL_PAYLOADS,
    { proposalId },
    options
  );

  return data.getProposalPayloads.nodes.map((p) => ({
    proposalId: p.proposalId,
    payloadId: p.payloadId,
    chainId: p.chainId,
    network: networkConfigs[p.chainId as keyof typeof networkConfigs]?.name || `Chain ${p.chainId}`,
    payloadsController: p.payloadsController,
    creator: p.creator,
    maximumAccessLevelRequired: p.maximumAccessLevelRequired,
    state: p.state || 'created',
    createdAt: p.createdAt,
    queuedAt: p.queuedAt,
    executedAt: p.executedAt,
    cancelledAt: p.cancelledAt,
  }));
}
