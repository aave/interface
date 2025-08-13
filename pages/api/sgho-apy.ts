import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchSGhoApyData } from 'pages/api/SGhoService';
import { ApiResponse } from 'pages/api/SGhoService.types';

/**
 * Next.js API route to fetch sGHO APY data from TokenLogic GraphQL API
 *
 * GET /api/sgho-apy
 * Query parameters:
 * - limit: number (optional, default: 100) - Number of records to fetch
 * - startDate: string (optional) - Start date for filtering (ISO format or YYYY-MM-DD)
 * - endDate: string (optional) - End date for filtering (ISO format or YYYY-MM-DD)
 *
 * Note: Both startDate and endDate must be provided together for date filtering to work.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const result = await fetchSGhoApyData({
      limit,
      startDate,
      endDate,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('API route error:', error);

    if (error.message.includes('GraphQL error')) {
      return res.status(400).json({
        error: error.message,
      });
    }

    if (error.message.includes('HTTP error')) {
      return res.status(502).json({
        error: 'Failed to fetch data from external service',
      });
    }
  }

  res.status(500).json({
    error: 'Internal server error',
  });
}
