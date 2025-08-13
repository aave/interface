import dayjs from 'dayjs';

import {
  ApiResponse,
  GraphQLResponse,
  SGhoApyQueryOptions,
  SGhoRatesData,
  TransformedDailyData,
} from './SGhoService.types';

export const sghoConfig = {
  graphqlEndpoint: 'https://tokenlogic-data.ddn.hasura.app/graphql',
  apiKey: process.env.TOKENLOGIC_API_KEY,
  defaultLimit: 1000,
} as const;

/**
 * GraphQL queries for sGHO APY data
 */
export const sghoQueries = {
  /**
   * Query for sGHO APY data with date range filtering
   */
  getApyHistoryDateRange: (startDate: string, endDate: string, limit: number) =>
    `{ aaveV3RatesSgho(limit: ${limit}, where: {blockHour: {_gte: "${startDate}", _lte: "${endDate}"}}) { blockHour apr } }`,

  /**
   * Query for recent sGHO APY data
   */
  getApyHistory: (limit: number) => `{ aaveV3RatesSgho(limit: ${limit}) { blockHour apr } }`,
} as const;

/**
 * Transform GraphQL data to the format expected by the frontend
 * Aggregates multiple hourly entries per day to a single daily entry
 */
export const transformGraphQLData = (graphqlData: SGhoRatesData[]): TransformedDailyData[] => {
  const dailyData = new Map<string, { timestamp: dayjs.Dayjs; merit_apy: number }>();

  graphqlData.forEach((item) => {
    const timestamp = dayjs(item.blockHour);
    const dateString = timestamp.format('YYYY-MM-DD');

    // Keep the latest entry for each day (or first if no existing entry)
    const existing = dailyData.get(dateString);
    if (!existing || timestamp.isAfter(existing.timestamp)) {
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
export const executeGraphQLQuery = async (query: string): Promise<GraphQLResponse> => {
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
/**
 * Normalize date string to ISO format without milliseconds (to match API expectation)
 */
const normalizeDate = (dateInput: string, isEndDate = false): string => {
  let date: dayjs.Dayjs;

  // Parse the input date
  date = dayjs(dateInput);

  // If it's just a date (YYYY-MM-DD), convert to proper start/end of day
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    if (isEndDate) {
      // End of day: 23:59:59
      date = date.endOf('day');
    } else {
      // Start of day: 00:00:00
      date = date.startOf('day');
    }
  }

  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

export const fetchSGhoApyData = async (options: SGhoApyQueryOptions): Promise<ApiResponse> => {
  const { limit = sghoConfig.defaultLimit, startDate, endDate } = options;

  // Determine which query to use based on whether date filtering is requested
  let query: string;

  if (startDate && endDate) {
    const normalizedStartDate = normalizeDate(startDate, false);
    const normalizedEndDate = normalizeDate(endDate, true);
    query = sghoQueries.getApyHistoryDateRange(normalizedStartDate, normalizedEndDate, limit);
  } else {
    query = sghoQueries.getApyHistory(limit);
  }

  const result = await executeGraphQLQuery(query);

  const transformedData = transformGraphQLData(result.data!.aaveV3RatesSgho);
  const sortedData = transformedData.sort((a, b) => {
    const dateA = dayjs(a.day.value);
    const dateB = dayjs(b.day.value);
    return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
  });

  return { data: sortedData };
};
