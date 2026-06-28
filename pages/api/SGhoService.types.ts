/**
 * Types for sGHO APY data service
 */

export type SGhoRatesData = {
  blockHour: string;
  apr: number;
};

export type GraphQLResponse = {
  data?: {
    aaveV3RatesSgho: SGhoRatesData[];
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
};

export type ApiResponse = {
  data?: Array<{
    day: { value: string };
    merit_apy: number;
  }>;
  error?: string;
};

export type SGhoApyQueryOptions = {
  limit?: number;
  startDate?: string;
  endDate?: string;
};

export type TransformedDailyData = {
  day: { value: string };
  merit_apy: number;
};
