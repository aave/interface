import {
  ApiResponse,
  GraphQLResponse,
  SGhoApyQueryOptions,
  SGhoRatesData,
  TransformedDailyData,
} from './SGhoService.types';

const sghoConfig = {
  graphqlEndpoint: 'https://tokenlogic-data.ddn.hasura.app/graphql',
  apiKey: process.env.TOKENLOGIC_API_KEY,
  defaultLimit: 100,
} as const;

/**
 * GraphQL queries for sGHO APY data
 */
export const sghoQueries = {
  /**
   * Query for sGHO APY data with date range filtering
   */
  getApyHistoryDateRange: `
    query GetSGhoApyHistoryDateRange($startDate: timestamptz!, $endDate: timestamptz!, $limit: Int!) {
      aaveV3RatesSgho(
        limit: $limit,
        where: {
          blockHour: {
            _gte: $startDate,
            _lte: $endDate
          }
        },
        order_by: { blockHour: asc }
      ) {
        blockHour
        apr
      }
    }
  `,

  /**
   * Query for recent sGHO APY data
   */
  getApyHistory: `
    query GetSGhoApyHistory($limit: Int!) {
      aaveV3RatesSgho(
        limit: $limit,
        order_by: { blockHour: asc }
      ) {
        blockHour
        apr
      }
    }
  `,
} as const;

/**
 * Transform GraphQL data to the format expected by the frontend
 * Aggregates multiple hourly entries per day to a single daily entry
 */
export const transformGraphQLData = (graphqlData: SGhoRatesData[]): TransformedDailyData[] => {
  const dailyData = new Map<string, { timestamp: Date; merit_apy: number }>();

  graphqlData.forEach((item) => {
    const timestamp = new Date(item.blockHour);
    const dateString = timestamp.toISOString().split('T')[0];

    // Keep the latest entry for each day (or first if no existing entry)
    const existing = dailyData.get(dateString);
    if (!existing || timestamp > existing.timestamp) {
      dailyData.set(dateString, {
        timestamp,
        merit_apy: item.apr,
      });
    }
  });

  return Array.from(dailyData.entries()).map(([dateString, { merit_apy }]) => ({
    day: {
      value: dateString,
    },
    merit_apy,
  }));
};

/**
 * Execute GraphQL query against the TokenLogic API
 */
export const executeGraphQLQuery = async (
  query: string,
  variables: Record<string, string | number>
): Promise<GraphQLResponse> => {
  if (!sghoConfig.apiKey) {
    throw new Error('TOKENLOGIC_API_KEY environment variable not set');
  }

  const response = await fetch(sghoConfig.graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': sghoConfig.apiKey,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error: ${response.status} - ${response.statusText}`);
  }

  const result: GraphQLResponse = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`);
  }

  if (!result.data?.aaveV3RatesSgho || !Array.isArray(result.data.aaveV3RatesSgho)) {
    throw new Error('Invalid response format from data source');
  }

  return result;
};

/**
 * Fetch and transform sGHO APY data
 */
export const fetchSGhoApyData = async (options: SGhoApyQueryOptions): Promise<ApiResponse> => {
  const { limit = sghoConfig.defaultLimit, startDate, endDate } = options;

  // Determine which query to use and prepare variables
  let query: string;
  let variables: Record<string, string | number>;

  if (startDate && endDate) {
    query = sghoQueries.getApyHistoryDateRange;
    variables = { startDate, endDate, limit };
  } else {
    query = sghoQueries.getApyHistory;
    variables = { limit };
  }

  const result = await executeGraphQLQuery(query, variables);

  // Transform the data (data is already sorted by blockHour from the GraphQL query)
  const transformedData = transformGraphQLData(result.data!.aaveV3RatesSgho);

  return { data: transformedData };
};
