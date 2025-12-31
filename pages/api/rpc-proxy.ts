import { ChainId } from '@aave/contract-helpers';
import { NextApiRequest, NextApiResponse } from 'next';

// Documentation: ./server-side-rpc-proxy.md
const NETWORK_CONFIG: Record<number, { network: string; apiKey: string }> = {
  // Mainnets
  [ChainId.mainnet]: { network: 'eth-mainnet', apiKey: process.env.MAINNET_RPC_API_KEY || '' },
  [ChainId.polygon]: { network: 'polygon-mainnet', apiKey: process.env.POLYGON_RPC_API_KEY || '' },
  [ChainId.avalanche]: { network: 'avax-mainnet', apiKey: process.env.AVALANCHE_RPC_API_KEY || '' },
  [ChainId.arbitrum_one]: {
    network: 'arb-mainnet',
    apiKey: process.env.ARBITRUM_RPC_API_KEY || '',
  },
  [ChainId.base]: { network: 'base-mainnet', apiKey: process.env.BASE_RPC_API_KEY || '' },
  [ChainId.optimism]: { network: 'opt-mainnet', apiKey: process.env.OPTIMISM_RPC_API_KEY || '' },
  [ChainId.metis_andromeda]: {
    network: 'metis-mainnet',
    apiKey: process.env.METIS_RPC_API_KEY || '',
  },
  [ChainId.xdai]: { network: 'gnosis-mainnet', apiKey: process.env.GNOSIS_RPC_API_KEY || '' },
  [ChainId.bnb]: { network: 'bnb-mainnet', apiKey: process.env.BNB_RPC_API_KEY || '' },
  [ChainId.scroll]: { network: 'scroll-mainnet', apiKey: process.env.SCROLL_RPC_API_KEY || '' },
  [ChainId.zksync]: { network: 'zksync-mainnet', apiKey: process.env.ZKSYNC_RPC_API_KEY || '' },
  [ChainId.linea]: { network: 'linea-mainnet', apiKey: process.env.LINEA_RPC_API_KEY || '' },
  [ChainId.sonic]: { network: 'sonic-mainnet', apiKey: process.env.SONIC_RPC_API_KEY || '' },
  [ChainId.celo]: { network: 'celo-mainnet', apiKey: process.env.CELO_RPC_API_KEY || '' },
  [ChainId.soneium]: { network: 'soneium-mainnet', apiKey: process.env.SONEIUM_RPC_API_KEY || '' },
  [ChainId.ink]: { network: 'ink-mainnet', apiKey: process.env.INK_RPC_API_KEY || '' },
  [ChainId.plasma]: { network: 'plasma-mainnet', apiKey: process.env.PLASMA_RPC_API_KEY || '' },

  // Testnets
  [ChainId.sepolia]: { network: 'eth-sepolia', apiKey: process.env.MAINNET_RPC_API_KEY || '' },
  [ChainId.fuji]: { network: 'avax-fuji', apiKey: process.env.AVALANCHE_RPC_API_KEY || '' },
  [ChainId.arbitrum_sepolia]: {
    network: 'arb-sepolia',
    apiKey: process.env.ARBITRUM_RPC_API_KEY || '',
  },
  [ChainId.base_sepolia]: { network: 'base-sepolia', apiKey: process.env.BASE_RPC_API_KEY || '' },
  [ChainId.optimism_sepolia]: {
    network: 'opt-sepolia',
    apiKey: process.env.OPTIMISM_RPC_API_KEY || '',
  },
  [ChainId.scroll_sepolia]: {
    network: 'scroll-sepolia',
    apiKey: process.env.SCROLL_RPC_API_KEY || '',
  },
};

function getRpcUrl(chainId: number): string | null {
  // Temp patch for Mantle and X Layer
  if (chainId === ChainId.mantle) {
    return 'https://mantle-rpc.publicnode.com';
  }
  if (chainId === ChainId.xlayer) {
    return 'https://xlayer.drpc.org';
  }

  const config = NETWORK_CONFIG[chainId];
  if (!config) return null;
  return `https://${config.network}.g.alchemy.com/v2/${config.apiKey}`;
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
    const { chainId, method, params } = req.body;
    const chainIdNumber = typeof chainId === 'string' ? parseInt(chainId) : chainId;
    const rpcUrl = getRpcUrl(chainIdNumber);

    if (!rpcUrl) {
      return res.status(400).json({ error: `Unsupported chain ID: ${chainIdNumber}` });
    }

    const rpcRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    };

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin || 'https://app.aave.com',
        Referer: 'https://app.aave.com/',
      },
      body: JSON.stringify(rpcRequest),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('RPC proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
