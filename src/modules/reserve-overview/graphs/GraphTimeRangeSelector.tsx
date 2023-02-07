import { reserveRateTimeRangeOptions } from 'src/hooks/useReservesHistory';

import { ESupportedTimeRanges, TimeRangeSelector } from '../TimeRangeSelector';

export interface GraphTimeRangeSelectorProps {
  disabled: boolean;
  timeRange: ESupportedTimeRanges;
  onTimeRangeChanged: (value: ESupportedTimeRanges) => void;
}

export const GraphTimeRangeSelector = ({
  disabled, // require disabled from parent
  timeRange,
  onTimeRangeChanged,
}: GraphTimeRangeSelectorProps) => (
  <TimeRangeSelector
    disabled={disabled}
    timeRanges={reserveRateTimeRangeOptions}
    selectedTimeRange={timeRange}
    onTimeRangeChanged={onTimeRangeChanged}
  />
);
