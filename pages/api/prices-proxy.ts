import { NextApiRequest, NextApiResponse } from 'next';

const FAMILY_API_URL = process.env.FAMILY_API_URL;

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
    const { tokenIds } = req.body;

    if (!tokenIds || !Array.isArray(tokenIds)) {
      return res.status(400).json({ error: 'tokenIds array is required' });
    }

    const familyApiKey = process.env.FAMILY_API_KEY;
    if (!familyApiKey || !FAMILY_API_URL) {
      console.error('FAMILY_API_KEY or FAMILY_API_URL environment variable is not set');
      return res.status(500).json({ error: 'Internal server error' });
    }

    const requestBody = {
      tokenIds,
    };

    const response = await fetch(FAMILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': familyApiKey,
        Origin: origin || 'https://app.aave.com',
        Referer: 'https://app.aave.com/',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Family API error:', response.status, response.statusText);
      return res.status(response.status).json({
        error: 'Failed to fetch prices from Family API',
        details: response.statusText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Family prices proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}
