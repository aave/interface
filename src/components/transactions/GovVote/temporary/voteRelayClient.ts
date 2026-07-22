// Client for the governance vote-relay (gas-sponsored voting), reached through the
// same-origin proxy at /api/governance/vote-relay/*. The relay encodes the
// `submitVoteBySignature` calldata itself, so the browser only sends the raw proofs
// and the EIP-712 signature. See governance-v3-cache PR #126 for the contract.

const RELAY_BASE = '/api/governance/vote-relay/v1/votes';

export interface RelayVotingBalanceProof {
  underlyingAsset: string;
  slot: string;
  proof: string;
}

export interface SubmitRelayVoteParams {
  chainId: number;
  proposalId: number;
  voter: string;
  support: boolean;
  votingBalanceProofs: RelayVotingBalanceProof[];
  signature: string; // 65-byte r||s||v hex string from signTypedData
}

interface VoteAccepted {
  externalId: string;
  transactionId: string;
  transactionHash: string | null;
  chainId: number;
  votingMachine: string;
  status: string;
}

interface VoteStatusResponse {
  transactionId: string;
  status: string;
  transactionHash: string | null;
}

// Relay status values (rrelayer). Anything not terminal keeps us polling.
const SUCCESS_STATUSES = ['MINED', 'CONFIRMED'];
const FAILURE_STATUSES = ['FAILED', 'EXPIRED', 'CANCELLED', 'DROPPED'];

export class RelayError extends Error {
  code: string;
  retryable: boolean;
  constructor(code: string, message: string, retryable: boolean) {
    super(message);
    this.name = 'RelayError';
    this.code = code;
    this.retryable = retryable;
  }
}

const parseError = async (res: Response): Promise<RelayError> => {
  try {
    const body = await res.json();
    const err = body?.error;
    if (err?.code) {
      return new RelayError(err.code, err.message ?? 'Vote relay error', !!err.retryable);
    }
  } catch {
    // fall through to a generic error below
  }
  const retryable = res.status === 503 || res.status === 429;
  return new RelayError('RELAY_ERROR', `Vote relay responded with ${res.status}`, retryable);
};

export const submitRelayVote = async (params: SubmitRelayVoteParams): Promise<VoteAccepted> => {
  const res = await fetch(RELAY_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as VoteAccepted;
};

// Poll the relay until the sponsored vote reaches a terminal state. Returns the
// mined transaction hash on success.
export const pollVoteStatus = async (
  transactionId: string,
  initialHash: string | null
): Promise<string> => {
  const maxAttempts = 40; // ~2 min at 3s intervals
  let lastHash = initialHash;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const res = await fetch(`${RELAY_BASE}/status/${transactionId}`);
    if (!res.ok) {
      // A transient status lookup failure shouldn't abort the vote — keep polling.
      continue;
    }

    const { status, transactionHash } = (await res.json()) as VoteStatusResponse;
    if (transactionHash) lastHash = transactionHash;

    if (SUCCESS_STATUSES.includes(status)) {
      if (!lastHash)
        throw new RelayError('RELAY_ERROR', 'Vote mined without a transaction hash', false);
      return lastHash;
    }
    if (FAILURE_STATUSES.includes(status)) {
      throw new RelayError('RELAY_ERROR', `Relayed vote ${status.toLowerCase()}`, false);
    }
    // PENDING | INMEMPOOL | REPLACED — keep waiting.
  }

  throw new RelayError('RELAY_ERROR', 'Timed out waiting for the relayed vote', true);
};
