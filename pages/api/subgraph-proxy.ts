import { ChainId } from '@aave/contract-helpers';
import { NextApiRequest, NextApiResponse } from 'next';

const subgraphApiKey = process.env.SUBGRAPH_API_KEY;

const SUBGRAPH_URLS: Record<string, string> = {
  // Governance Core
  'governance-core': `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/A7QMszgomC9cnnfpAcqZVLr2DffvkGNfimD8iUSMiurK`,

  // Voting Machines by chain
  [`voting-machine-${ChainId.mainnet}`]: `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/2QPwuCfFtQ8WSCZoN3i9SmdoabMzbq2pmg4kRbrhymBV`,
  [`voting-machine-${ChainId.polygon}`]: `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/72ysXwyqW9CvfqD8keWo2fEfdKZQRWGYdgC6cnvTSFKy`,
  [`voting-machine-${ChainId.avalanche}`]: `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/FngMWWGJV45McvV7GUBkrta9eoEi3sHZoH7MYnFQfZkr`,

  // Bridge subgraphs
  [`bridge-${ChainId.mainnet}`]: `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/E11p8T4Ff1DHZbwSUC527hkUb5innVMdTuP6A2s1xtm1`,
  [`bridge-${ChainId.arbitrum_one}`]: `https://gateway-arbitrum.network.thegraph.com/api/${subgraphApiKey}/subgraphs/id/GPpZfiGoDChLsiWoMG5fxXdRNEYrsVDrKJ39moGcbz6i`,
  [`bridge-${ChainId.avalanche}`]: `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/7RqaLvSMWBv4Z3xmv4kb6Jq3t59ikYG3wpcsTnLgBWzt`,
  [`bridge-${ChainId.base}`]: `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/7WRSEgg43s2CqpymK2wkHrhQjn4v5fEnufonwRkkokbM`,
  [`bridge-${ChainId.xdai}`]: `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/CFjU1G9iUtFDqEBTzSePRiPjghjUzQeFX5C67DGSK2Ao`,
  [`bridge-${ChainId.sepolia}`]: `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/CZxebNCRkL9RHpFcQcDnRdQMB4yBM8PFgz5NKEHKtrw6`,
  [`bridge-${ChainId.arbitrum_sepolia}`]: `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/8NWTrc4S6xwaBbajongofytQfQisqYm1zR2ghGEtRFSc`,
  [`bridge-${ChainId.base_sepolia}`]: `https://gateway.thegraph.com/api/${subgraphApiKey}/subgraphs/id/8bpqvL6XBCVhN4heE9rdEwgTketeZ2U5vVGEh5fDoUEH`,
};

function getSubgraphUrl(type: string): string | null {
  return SUBGRAPH_URLS[type] || null;
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
    const { type, query, variables } = req.body;

    if (!type || !query) {
      return res.status(400).json({ error: 'Missing required fields: type and query' });
    }

    const subgraphUrl = getSubgraphUrl(type);

    if (!subgraphUrl) {
      return res.status(400).json({ error: `Unsupported subgraph type: ${type}` });
    }

    const response = await fetch(subgraphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
