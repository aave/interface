import type { NextApiRequest, NextApiResponse } from 'next';

const GRAPHQL_ENDPOINT = 'https://tokenlogic-data.ddn.hasura.app/graphql';
const API_KEY = process.env.TOKENLOGIC_API_KEY;

type SGhoRatesData = {
  blockHour: string;
  apr: number;
};

type GraphQLResponse = {
  data?: {
    aaveV3RatesSgho: SGhoRatesData[];
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
};

type ApiResponse = {
  data?: Array<{
    day: { value: string };
    merit_apy: number;
  }>;
  error?: string;
};

/**
 * Transform GraphQL data to the format expected by the frontend
 */
const transformGraphQLData = (graphqlData: SGhoRatesData[]) => {
  return graphqlData.map((item) => {
    // Convert blockHour (ISO datetime) to date string (YYYY-MM-DD)
    const date = new Date(item.blockHour);
    const dateString = date.toISOString().split('T')[0];

    return {
      day: {
        value: dateString,
      },
      merit_apy: item.apr,
    };
  });
};

/**
 * Next.js API route to fetch sGHO APY data from TokenLogic GraphQL API
 *
 * GET /api/sgho-apy
 * Query parameters:
 * - limit: number (optional, default: 100) - Number of records to fetch
 * - startDate: string (optional) - Start date for filtering (ISO format)
 * - endDate: string (optional) - End date for filtering (ISO format)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('TOKENLOGIC_API_KEY environment variable not set');
      return res.status(500).json({
        error: 'Server configuration error',
      });
    }

    // Parse query parameters
    const limit = parseInt(req.query.limit as string) || 100;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build GraphQL query based on parameters
    let graphqlQuery: string;
    let variables: Record<string, string>;

    if (startDate && endDate) {
      // Query with date range
      graphqlQuery = `
        query GetSGhoApyHistoryDateRange($startDate: timestamptz!, $endDate: timestamptz!, $limit: Int!) {
          aaveV3RatesSgho(
            limit: $limit,
            where: {
              blockHour: {
                _gte: $startDate,
                _lte: $endDate
              }
            }
          ) {
            blockHour
            apr
          }
        }
      `;
      variables = { startDate, endDate, limit };
    } else {
      // Query for recent data
      graphqlQuery = `
        query GetSGhoApyHistory($limit: Int!) {
          aaveV3RatesSgho(limit: $limit) {
            blockHour
            apr
          }
        }
      `;
      variables = { limit };
    }

    // Make GraphQL request
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables,
      }),
    });

    if (!response.ok) {
      console.error(`GraphQL HTTP error: ${response.status}`);
      return res.status(response.status).json({
        error: `Failed to fetch data: ${response.statusText}`,
      });
    }

    const result: GraphQLResponse = await response.json();

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL errors:', result.errors);
      return res.status(400).json({
        error: `GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`,
      });
    }

    // Validate response structure
    if (!result.data?.aaveV3RatesSgho || !Array.isArray(result.data.aaveV3RatesSgho)) {
      console.error('Invalid GraphQL response format:', result);
      return res.status(500).json({
        error: 'Invalid response format from data source',
      });
    }

    // Transform and sort data
    const transformedData = transformGraphQLData(result.data.aaveV3RatesSgho);

    // Sort by date (oldest first) since we removed ordering from GraphQL query
    const sortedData = transformedData.sort((a, b) => {
      const dateA = new Date(a.day.value);
      const dateB = new Date(b.day.value);
      return dateA.getTime() - dateB.getTime();
    });

    // Return successful response
    res.status(200).json({ data: sortedData });
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}
