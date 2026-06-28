import React from 'react';
import { useSGhoApyHistory } from 'src/hooks/useSGhoApyHistory';

import { MeritApyDataItem } from './MeritApyGraph';
import { MeritApyGraphContainer } from './MeritApyGraphContainer';

// Example using the API hook - basic usage
export const SGhoApyGraphWithAPI = () => {
  const { data, loading, error, refetch } = useSGhoApyHistory();

  return (
    <MeritApyGraphContainer
      data={data}
      loading={loading}
      error={error}
      lineColor="#2EBAC6"
      showAverage={true}
      title="sGHO Merit APY"
      onRetry={refetch}
    />
  );
};

// Example with custom limit
export const SGhoApyGraphWithCustomLimit = () => {
  const { data, loading, error, refetch } = useSGhoApyHistory({ limit: 50 });

  return (
    <MeritApyGraphContainer
      data={data}
      loading={loading}
      error={error}
      lineColor="#B6509E"
      showAverage={true}
      title="sGHO Merit APY (Last 50 records)"
      onRetry={refetch}
    />
  );
};

// Example with date range filtering
export const SGhoApyGraphWithDateRange = () => {
  // Get data for the last 30 days
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, loading, error, refetch } = useSGhoApyHistory({
    startDate,
    endDate,
    limit: 1000,
  });

  return (
    <MeritApyGraphContainer
      data={data}
      loading={loading}
      error={error}
      lineColor="#0062D2"
      showAverage={true}
      title="sGHO Merit APY (Last 30 days)"
      onRetry={refetch}
    />
  );
};

// Example with static data for testing
export const MeritApyGraphExample = () => {
  // Sample data matching your format
  const sampleData: MeritApyDataItem[] = [
    {
      day: {
        value: '2025-06-12',
      },
      merit_apy: 0.0813085074037682,
    },
    {
      day: {
        value: '2025-06-13',
      },
      merit_apy: 0.0813085074037682,
    },
    {
      day: {
        value: '2025-06-14',
      },
      merit_apy: 0.0813085074037682,
    },
    {
      day: {
        value: '2025-06-18',
      },
      merit_apy: 0.08881078008904714,
    },
    {
      day: {
        value: '2025-06-20',
      },
      merit_apy: 0.08656168710390917,
    },
    {
      day: {
        value: '2025-07-24',
      },
      merit_apy: 0.08966912163943143,
    },
    {
      day: {
        value: '2025-07-31',
      },
      merit_apy: 0.09348568674999676,
    },
  ];

  return (
    <MeritApyGraphContainer
      data={sampleData}
      loading={false}
      error={false}
      lineColor="#2EBAC6"
      showAverage={true}
      title="Merit APY"
      onRetry={() => {
        console.log('Retrying data fetch...');
      }}
    />
  );
};

// Example with loading state
export const MeritApyGraphLoadingExample = () => {
  return <MeritApyGraphContainer data={[]} loading={true} error={false} title="Merit APY" />;
};

// Example with error state
export const MeritApyGraphErrorExample = () => {
  return (
    <MeritApyGraphContainer
      data={[]}
      loading={false}
      error={true}
      title="Merit APY"
      onRetry={() => {
        alert('Retry clicked!');
      }}
    />
  );
};

// Example with custom styling
export const MeritApyGraphCustomExample = () => {
  const customData: MeritApyDataItem[] = [
    {
      day: { value: '2025-01-01' },
      merit_apy: 0.05,
    },
    {
      day: { value: '2025-01-15' },
      merit_apy: 0.07,
    },
    {
      day: { value: '2025-02-01' },
      merit_apy: 0.06,
    },
    {
      day: { value: '2025-02-15' },
      merit_apy: 0.08,
    },
  ];

  return (
    <MeritApyGraphContainer
      data={customData}
      loading={false}
      error={false}
      lineColor="#B6509E" // Purple color like borrow rate
      showAverage={false} // Hide average line
      title="Custom Merit APY"
    />
  );
};
