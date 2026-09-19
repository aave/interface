import type { NextApiRequest, NextApiResponse } from 'next';
import { getCowOrderbookChainSlug } from 'src/utils/cowOrderbook';

const COW_API_BASE_URL = 'https://api.cow.fi';
const ORDER_UID_REGEX = /^0x[a-fA-F0-9]{112,}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const chainId = Number(req.query.chainId);
  const orderUid = Array.isArray(req.query.orderUid) ? req.query.orderUid[0] : req.query.orderUid;
  const chainSlug = getCowOrderbookChainSlug(chainId);

  if (!chainSlug) {
    return res.status(400).json({ error: 'Unsupported CoW orderbook chain' });
  }

  if (!orderUid || !ORDER_UID_REGEX.test(orderUid)) {
    return res.status(400).json({ error: 'Invalid order UID' });
  }

  try {
    const response = await fetch(`${COW_API_BASE_URL}/${chainSlug}/api/v1/orders/${orderUid}`, {
      headers: { Accept: 'application/json' },
    });
    const body = await response.text();

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json');

    return res.status(response.status).send(body);
  } catch (error) {
    console.error('CoW order proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
