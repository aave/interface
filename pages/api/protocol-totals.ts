import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchProtocolTotals, ProtocolTotals } from 'pages/api/ProtocolTotalsService';

// These totals move by a fraction of a percent an hour, so the CDN serves one
// upstream read to every visitor for half an hour and keeps TokenLogic clear of
// any rate limit. Errors are never cached.
const CACHE_CONTROL = 'public, s-maxage=1800, stale-while-revalidate=3600';

type ApiResponse = ProtocolTotals | { error: string };

/**
 * GET /api/protocol-totals
 *
 * Whole-protocol deposit and loan totals in USD across every Aave version and chain,
 * with a per-protocol breakdown. Server-only: the TokenLogic key never reaches the client.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.TL_API_KEY;
  if (!apiKey) {
    // A configuration state, not a failed read: the client renders no figures.
    return res.status(503).json({ error: 'Protocol totals are not configured' });
  }

  try {
    const totals = await fetchProtocolTotals(apiKey);
    res.setHeader('Cache-Control', CACHE_CONTROL);
    return res.status(200).json(totals);
  } catch (error) {
    console.error('Protocol totals unavailable:', error);
    return res.status(502).json({ error: 'Failed to fetch data from external service' });
  }
}
