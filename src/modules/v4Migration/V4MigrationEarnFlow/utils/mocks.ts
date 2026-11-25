import { SparklineDatum } from 'src/components/charts/SparklineChart';

import { MigrationAsset } from '../../V4MigrationPage/utils/types';

/**
 * Hub figures the migration API does not return yet. Everything in this file is made up and has to
 * be replaced with real data before the flow ships.
 */

export const MOCK_TOTAL_DEPOSITS_USD = 45_620_000;

export const MOCK_HAS_INCENTIVES = true;

export const MOCK_BACKING_COLLATERAL: MigrationAsset[] = [
  {
    symbol: 'wstETH',
    name: 'Wrapped liquid staked Ether 2.0',
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  },
  {
    symbol: 'weETH',
    name: 'Wrapped eETH',
    address: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
];

const HOURS = 7 * 24;
const HOUR_MS = 60 * 60 * 1000;
// Fixed, so the chart does not change between renders.
const MOCK_HISTORY_END = Date.UTC(2026, 10, 25);

/** A week of hourly rates that wanders up to `apy`, the same for a given seed. */
export const mockApyHistory = (apy: number, seed: number): SparklineDatum[] => {
  let state = (seed % 2147483646) + 1;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647 - 0.5;
  };

  let drift = -0.3;
  return Array.from({ length: HOURS + 1 }, (_, hour) => {
    drift += random() * 0.06 + 0.3 / HOURS;
    const progress = hour / HOURS;
    // Pulled towards today's rate as the week ends, so the last point is exactly `apy`.
    const value = apy * (1 + drift * (1 - progress));
    return {
      date: new Date(MOCK_HISTORY_END - (HOURS - hour) * HOUR_MS),
      value: Math.max(value, 0),
    };
  });
};

export const average = (history: SparklineDatum[]) =>
  history.reduce((sum, { value }) => sum + value, 0) / history.length;
