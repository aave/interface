import { NextApiRequest, NextApiResponse } from 'next';

// Same-origin proxy for the governance vote-relay (gas-sponsored voting).
// The browser never holds the relay's api key: it calls this route, which attaches
// the server-side `x-api-key` and forwards to the relay, mirroring `rpc-proxy.ts`.
// See governance-v3-cache PR #126 for the relay contract.
const VOTE_RELAY_URL = process.env.VOTE_RELAY_URL; // e.g. https://governance-cache-api.aave.com/relay
const VOTE_RELAY_API_KEY = process.env.VOTE_RELAY_API_KEY;

// Only these relay routes may be proxied — an allowlist so this can't be used as an
// open proxy against the relay. Matched against the path segments after the api route.
const isAllowed = (method: string, segments: string[]): boolean => {
  const [v1, votes, ...rest] = segments;
  if (v1 !== 'v1' || votes !== 'votes') return false;

  if (method === 'POST') {
    // POST /v1/votes  or  POST /v1/votes/representative
    return rest.length === 0 || (rest.length === 1 && rest[0] === 'representative');
  }

  if (method === 'GET') {
    // GET /v1/votes/status/{transactionId}
    if (rest.length === 2 && rest[0] === 'status') return true;
    // GET /v1/votes/{chainId}/{proposalId}/{voter}
    if (rest.length === 3 && rest[0] !== 'status' && rest[0] !== 'representative') return true;
    return false;
  }

  return false;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method ?? 'GET';
  if (method !== 'POST' && method !== 'GET') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed', retryable: false },
    });
  }

  if (!VOTE_RELAY_URL || !VOTE_RELAY_API_KEY) {
    // Mirror the relay's own transient shape so the client's fallback path triggers.
    return res.status(503).json({
      error: {
        code: 'RELAYER_UNAVAILABLE',
        message: 'Vote relay is not configured',
        retryable: true,
      },
    });
  }

  const rawPath = req.query.path;
  const segments = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];

  if (!isAllowed(method, segments)) {
    return res
      .status(404)
      .json({ error: { code: 'NOT_FOUND', message: 'Unknown relay route', retryable: false } });
  }

  const target = `${VOTE_RELAY_URL.replace(/\/$/, '')}/${segments.join('/')}`;

  // Forward the caller IP so the relay's per-IP rate limiter keys on the real client.
  const forwardedFor = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

  try {
    const relayResponse = await fetch(target, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': VOTE_RELAY_API_KEY,
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      },
      body: method === 'POST' ? JSON.stringify(req.body ?? {}) : undefined,
    });

    // Pass the relay's status and JSON body straight through so the client sees the
    // real status codes (202/409/503/…) and the { error: { code, … } } shape.
    const text = await relayResponse.text();
    res.status(relayResponse.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(text || '{}');
  } catch (error) {
    return res.status(503).json({
      error: { code: 'RELAYER_UNAVAILABLE', message: 'Vote relay unreachable', retryable: true },
    });
  }
}
