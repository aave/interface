import type { NextApiRequest, NextApiResponse } from 'next';
import { getCowOrderbookChainSlug } from 'src/utils/cowOrderbook';

const COW_API_BASE_URL = 'https://api.cow.fi';
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const parsePositiveInteger = (value: string | string[] | undefined, fallback: number) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const chainId = Number(req.query.chainId);
  const owner = Array.isArray(req.query.owner) ? req.query.owner[0] : req.query.owner;
  const limit = Math.min(parsePositiveInteger(req.query.limit, 50), 100);
  const offset = parsePositiveInteger(req.query.offset, 0);
  const chainSlug = getCowOrderbookChainSlug(chainId);

  if (!chainSlug) {
    return res.status(400).json({ error: 'Unsupported CoW orderbook chain' });
  }

  if (!owner || !ADDRESS_REGEX.test(owner)) {
    return res.status(400).json({ error: 'Invalid owner address' });
  }

  try {
    const url = new URL(`${COW_API_BASE_URL}/${chainSlug}/api/v1/account/${owner}/orders`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const body = await response.text();

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json');

    return res.status(response.status).send(body);
  } catch (error) {
    console.error('CoW orders proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
