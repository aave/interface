import { NextApiRequest, NextApiResponse } from 'next';
import { VotingMachine__factory } from 'src/components/transactions/GovVote/temporary/typechain/factory/VotingMachine__factory';
import { governanceV3Config } from 'src/ui-config/governanceConfig';

// Gelato's sponsored-call REST endpoint. The sponsor key authorizes gas payment
// from our 1Balance account and must never reach the browser, so the call lives here.
const GELATO_SPONSORED_CALL_URL = 'https://api.gelato.digital/relays/v2/sponsored-call';

// Only submitVoteBySignature may be relayed — anything else would let callers spend
// sponsored gas on arbitrary transactions.
const SUBMIT_VOTE_BY_SIGNATURE_SELECTOR = VotingMachine__factory.createInterface()
  .getSighash('submitVoteBySignature')
  .toLowerCase();

// chainId -> voting machine address, the only targets we relay to.
const VOTING_MACHINES: Record<number, string> = Object.entries(
  governanceV3Config.votingChainConfig
).reduce((acc, [chainId, config]) => {
  acc[Number(chainId)] = config.votingMachineAddress.toLowerCase();
  return acc;
}, {} as Record<number, string>);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sponsorApiKey = process.env.GELATO_SPONSOR_KEY;
  if (!sponsorApiKey) {
    return res.status(503).json({ error: 'Gasless voting is not configured' });
  }

  const { chainId, target, data } = req.body ?? {};
  const chainIdNumber = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;

  const expectedTarget = VOTING_MACHINES[chainIdNumber];
  if (!expectedTarget || typeof target !== 'string' || target.toLowerCase() !== expectedTarget) {
    return res.status(400).json({ error: 'Target is not a known voting machine' });
  }

  if (
    typeof data !== 'string' ||
    data.slice(0, 10).toLowerCase() !== SUBMIT_VOTE_BY_SIGNATURE_SELECTOR
  ) {
    return res.status(400).json({ error: 'Calldata is not a submitVoteBySignature call' });
  }

  try {
    const response = await fetch(GELATO_SPONSORED_CALL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chainId: chainIdNumber, target, data, sponsorApiKey }),
    });

    const result = await response.json();
    if (!response.ok || !result?.taskId) {
      return res.status(502).json({ error: 'Relay request failed', details: result });
    }

    return res.status(200).json({ taskId: result.taskId });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
