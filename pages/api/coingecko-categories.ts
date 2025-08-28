import { NextApiRequest, NextApiResponse } from 'next';

const CG_ENDPOINT = 'https://pro-api.coingecko.com/api/v3/coins/markets';
const HEADERS: HeadersInit = {
  accept: 'application/json',
  'x-cg-pro-api-key': process.env.COINGECKO_API_KEY ?? '',
};
interface CoinGeckoCoin {
  id: string;
  symbol: string;
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

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const coingeckoApiKey = process.env.COINGECKO_API_KEY;
    if (!coingeckoApiKey) {
      return res.status(500).json({ error: 'CoinGecko API key is not configured' });
    }

    // Fetch for Stablecoins Category
    const [resStable1, resStable2] = await Promise.all([
      fetch(`${CG_ENDPOINT}?vs_currency=usd&category=stablecoins&per_page=250&page=1`, {
        method: 'GET',
        headers: HEADERS,
      }),
      fetch(`${CG_ENDPOINT}?vs_currency=usd&category=stablecoins&per_page=250&page=2`, {
        method: 'GET',
        headers: HEADERS,
      }),
    ]);

    if (!resStable1.ok) {
      return res.status(resStable1.status).json({
        error: `Error fetching stablecoins page 1`,
        details: resStable1.statusText,
      });
    }
    if (!resStable2.ok) {
      return res.status(resStable2.status).json({
        error: `Error fetching stablecoins page 2`,
        details: resStable2.statusText,
      });
    }

    const [dataStable1, dataStable2] = await Promise.all([resStable1.json(), resStable2.json()]);
    const combinedData = [...dataStable1, ...dataStable2];

    const processedSymbols = combinedData
      .map((coin: CoinGeckoCoin) => coin.symbol?.toUpperCase())
      .filter((symbol: string) => symbol);

    const uniqueSymbolsStablecoins = [...new Set([...processedSymbols])];

    // Fetch for ETH Categories
    const [resEth1, resEth2, resEth3] = await Promise.all([
      fetch(`${CG_ENDPOINT}?vs_currency=usd&category=liquid-staked-eth&per_page=250&page=1`, {
        method: 'GET',
        headers: HEADERS,
      }),
      fetch(`${CG_ENDPOINT}?vs_currency=usd&category=ether-fi-ecosystem&per_page=250&page=1`, {
        method: 'GET',
        headers: HEADERS,
      }),
      fetch(`${CG_ENDPOINT}?vs_currency=usd&category=liquid-staking-tokens&per_page=250&page=1`, {
        method: 'GET',
        headers: HEADERS,
      }),
    ]);

    if (!resEth1.ok) {
      return res.status(resEth1.status).json({
        error: `Error fetching liquid-staked-eth`,
        details: resEth1.statusText,
      });
    }
    if (!resEth2.ok) {
      return res.status(resEth2.status).json({
        error: `Error fetching ether-fi-ecosystem`,
        details: resEth2.statusText,
      });
    }
    if (!resEth3.ok) {
      return res.status(resEth3.status).json({
        error: `Error fetching liquid-staking-tokens`,
        details: resEth3.statusText,
      });
    }

    const [dataEth1, dataEth2, dataEth3] = await Promise.all([
      resEth1.json(),
      resEth2.json(),
      resEth3.json(),
    ]);
    // Filter category 'liquid-staking-tokens' to only include coins correlated to ETH
    const filteredData3 = dataEth3.filter((coin: CoinGeckoCoin) => {
      const symbol = coin.symbol?.toUpperCase();
      return symbol?.includes('ETH');
    });

    const combinedDataEth = [...dataEth1, ...dataEth2, ...filteredData3];

    const symbols = combinedDataEth
      .map((coin: CoinGeckoCoin) => coin.symbol?.toUpperCase())
      .filter((symbol: string) => symbol);

    const uniqueSymbolsEth = [...new Set([...symbols, 'WETH'])];

    return res.status(200).json({ uniqueSymbolsStablecoins, uniqueSymbolsEth });
  } catch (error) {
    console.error('Coingecko categories proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
