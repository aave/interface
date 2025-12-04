import { NextApiRequest, NextApiResponse } from 'next';
import { SUBGRAPH_IDS, SubgraphKey } from 'src/utils/subgraphRequest';

const subgraphApiKey = process.env.SUBGRAPH_API_KEY;

function buildSubgraphUrl(subgraphId: string): string {
  return `https://gateway.thegraph.com/api/subgraphs/id/${subgraphId}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigins = ['https://app.aave.com', 'https://aave.com'];
  const origin = req.headers.origin;

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return false;

    if (allowedOrigins.includes(origin)) return true;

    // Match any subdomain ending with avaraxyz.vercel.app for deployment urls
    const allowedPatterns = [/^https:\/\/.*avaraxyz\.vercel\.app$/];

    return allowedPatterns.some((pattern) => pattern.test(origin));
  };

  if (process.env.CORS_DOMAINS_ALLOWED === 'true') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      subgraphKey,
      query,
      variables,
    }: { subgraphKey: SubgraphKey; query: string; variables?: Record<string, unknown> } = req.body;

    if (!subgraphKey || !query) {
      return res.status(400).json({ error: 'Missing required fields: subgraphKey and query' });
    }

    if (!(subgraphKey in SUBGRAPH_IDS)) {
      return res.status(400).json({ error: 'Invalid subgraph key' });
    }

    const subgraphUrl = buildSubgraphUrl(SUBGRAPH_IDS[subgraphKey]);

    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${subgraphApiKey}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('Subgraph proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
