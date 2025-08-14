import { TimeWindow } from '@aave/react';
import dayjs from 'dayjs';
import { sghoConfig } from 'pages/api/SGhoService';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MeritApyDataItem } from 'src/modules/reserve-overview/graphs/MeritApyGraph';

type SGhoApyApiResponse = {
  data?: MeritApyDataItem[];
  error?: string;
};

type UseSGhoApyHistoryReturn = {
  data: MeritApyDataItem[];
  loading: boolean;
  error: boolean;
  refetch: () => void;
};

type UseSGhoApyHistoryOptions = {
  limit?: number;
  startDate?: string;
  endDate?: string;
  timeRange?: TimeWindow;
};

/**
 * Convert time range to start/end dates
 */
const timeRangeToDateRange = (timeRange: TimeWindow): { startDate: string; endDate: string } => {
  const endDate = dayjs().format('YYYY-MM-DD');
  let startDate: string;

  switch (timeRange) {
    case TimeWindow.LastWeek:
      startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      break;
    case TimeWindow.LastMonth:
      startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
      break;
    case TimeWindow.LastSixMonths:
      startDate = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
      break;
    default:
      startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
  }

  return { startDate, endDate };
};

/**
 * Custom hook to fetch sGHO APY history data from internal API endpoint
 *
 * @param options - Optional parameters for the API call
 * @param options.limit - Number of records to fetch (default: 100)
 * @param options.startDate - Start date for filtering (ISO format)
 * @param options.endDate - End date for filtering (ISO format)
 * @returns {UseSGhoApyHistoryReturn} Object containing data, loading state, error state, and refetch function
 */
export const useSGhoApyHistory = (
  options: UseSGhoApyHistoryOptions = {}
): UseSGhoApyHistoryReturn => {
  const [data, setData] = useState<MeritApyDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Stabilize the options to prevent unnecessary re-fetches
  const stableOptions = useMemo(
    () => options,
    [options.limit, options.startDate, options.endDate, options.timeRange]
  );

  const { limit = sghoConfig.defaultLimit, timeRange } = stableOptions;

  // Determine dates: use timeRange if provided, otherwise use explicit startDate/endDate
  const { startDate, endDate } = useMemo(() => {
    if (timeRange) {
      return timeRangeToDateRange(timeRange);
    }
    return {
      startDate: stableOptions.startDate,
      endDate: stableOptions.endDate,
    };
  }, [timeRange, stableOptions.startDate, stableOptions.endDate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      // Call internal API endpoint
      const response = await fetch(`/api/sgho-apy?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result: SGhoApyApiResponse = await response.json();

      // Check for API errors
      if (result.error) {
        throw new Error(`API error: ${result.error}`);
      }

      // Validate the response structure
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid API response format');
      }

      setData(result.data);
    } catch (err) {
      console.error('Error fetching sGHO APY data:', err);
      setError(true);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [limit, startDate, endDate]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};
