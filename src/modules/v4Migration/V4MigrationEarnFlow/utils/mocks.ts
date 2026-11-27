import { SparklineDatum } from 'src/components/charts/SparklineChart';

/**
 * A figure neither API returns yet: a borrow market's 7-day position APY. Everything in this file
 * is made up and has to be replaced before the flow ships.
 */

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
