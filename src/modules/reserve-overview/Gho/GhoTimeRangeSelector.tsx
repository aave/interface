import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import {
  ESupportedTimeRanges,
  TimeRangeSelector,
  TimeRangeSelectorProps,
} from '../TimeRangeSelector';

dayjs.extend(duration);

export interface GhoTimeRangeSelectorProps {
  disabled?: boolean;
  timeRange: ESupportedTimeRanges;
  onTimeRangeChanged: (value: ESupportedTimeRanges) => void;
  sx?: TimeRangeSelectorProps['sx'];
}

export const ghoTimeRangeOptions = [
  ESupportedTimeRanges.OneYear,
  ESupportedTimeRanges.TwoYears,
  ESupportedTimeRanges.FiveYears,
];

export type GhoBorrowTermRange = typeof ghoTimeRangeOptions[number];

// Utility helper for working with these time ranges
export const getSecondsForGhoBorrowTermDuration = (timeRange: GhoBorrowTermRange): number => {
  switch (timeRange) {
    case ESupportedTimeRanges.OneMonth:
      return dayjs.duration({ days: 31 }).asSeconds();
    case ESupportedTimeRanges.ThreeMonths:
      return dayjs.duration({ years: 0.25 }).asSeconds();
    case ESupportedTimeRanges.SixMonths:
      return dayjs.duration({ years: 0.5 }).asSeconds();
    case ESupportedTimeRanges.OneYear:
      return dayjs.duration({ years: 1 }).asSeconds();
    case ESupportedTimeRanges.TwoYears:
      return dayjs.duration({ years: 2 }).asSeconds();
    case ESupportedTimeRanges.FiveYears:
      return dayjs.duration({ years: 5 }).asSeconds();
    default:
      // Return today as a fallback
      return dayjs.duration({ days: 1 }).asSeconds();
  }
};

export const GhoTimeRangeSelector = ({
  disabled = false, // support default fallback
  timeRange,
  sx,
  onTimeRangeChanged,
}: GhoTimeRangeSelectorProps) => (
  <TimeRangeSelector
    disabled={disabled}
    timeRanges={ghoTimeRangeOptions}
    selectedTimeRange={timeRange}
    onTimeRangeChanged={onTimeRangeChanged}
    sx={sx}
  />
);
