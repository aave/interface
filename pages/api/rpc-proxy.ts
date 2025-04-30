import { ChainId } from '@aave/contract-helpers';
import { NextApiRequest, NextApiResponse } from 'next';

import { networkConfigs } from '../../src/ui-config/networksConfig';

// Add environment variables for private RPC URLs
// These should be set in your server environment and not exposed to the client
const PRIVATE_RPC_URLS: Record<string, string> = {
  [ChainId.mainnet]:
    process.env.PRIVATE_RPC_MAINNET || networkConfigs[ChainId.mainnet].privateJsonRPCUrl || '',
  [ChainId.polygon]:
    process.env.PRIVATE_RPC_POLYGON || networkConfigs[ChainId.polygon].privateJsonRPCUrl || '',
  [ChainId.avalanche]:
    process.env.PRIVATE_RPC_AVALANCHE || networkConfigs[ChainId.avalanche].privateJsonRPCUrl || '',
  [ChainId.arbitrum_one]:
    process.env.PRIVATE_RPC_ARBITRUM ||
    networkConfigs[ChainId.arbitrum_one].privateJsonRPCUrl ||
    '',
  [ChainId.base]:
    process.env.PRIVATE_RPC_BASE || networkConfigs[ChainId.base].privateJsonRPCUrl || '',
  [ChainId.optimism]:
    process.env.PRIVATE_RPC_OPTIMISM || networkConfigs[ChainId.optimism].privateJsonRPCUrl || '',
  [ChainId.metis_andromeda]:
    process.env.PRIVATE_RPC_METIS ||
    networkConfigs[ChainId.metis_andromeda].privateJsonRPCUrl ||
    '',
  [ChainId.xdai]:
    process.env.PRIVATE_RPC_GNOSIS || networkConfigs[ChainId.xdai].privateJsonRPCUrl || '',
  [ChainId.bnb]: process.env.PRIVATE_RPC_BNB || networkConfigs[ChainId.bnb].privateJsonRPCUrl || '',
  [ChainId.scroll]:
    process.env.PRIVATE_RPC_SCROLL || networkConfigs[ChainId.scroll].privateJsonRPCUrl || '',
  [ChainId.zksync]:
    process.env.PRIVATE_RPC_ZKSYNC || networkConfigs[ChainId.zksync].privateJsonRPCUrl || '',
  [ChainId.linea]:
    process.env.PRIVATE_RPC_LINEA || networkConfigs[ChainId.linea].privateJsonRPCUrl || '',
  [ChainId.sonic]:
    process.env.PRIVATE_RPC_SONIC || networkConfigs[ChainId.sonic].privateJsonRPCUrl || '',
  [ChainId.celo]:
    process.env.PRIVATE_RPC_CELO || networkConfigs[ChainId.celo].privateJsonRPCUrl || '',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedOrigins = [
    'https://app.aave.com',
    'https://aave.com',
    'https://interface-git-feat-rpc-avaraxyz.vercel.app',
  ];
  const origin = req.headers.origin;

  if (process.env.CORS_DOMAINS_ALLOWED === 'true') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
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
    const rpcUrl = PRIVATE_RPC_URLS[chainIdNumber];

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
