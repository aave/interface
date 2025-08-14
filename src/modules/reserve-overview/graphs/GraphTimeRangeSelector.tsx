import { TimeWindow } from '@aave/react';

import { TimeRangeSelector } from '../TimeRangeSelector';

export interface GraphTimeRangeSelectorProps {
  disabled: boolean;
  timeRange: TimeWindow;
  onTimeRangeChanged: (value: TimeWindow) => void;
}

export const GraphTimeRangeSelector = ({
  disabled, // require disabled from parent
  timeRange,
  onTimeRangeChanged,
}: GraphTimeRangeSelectorProps) => (
  <TimeRangeSelector
    disabled={disabled}
    timeRanges={[
      TimeWindow.LastWeek,
      TimeWindow.LastMonth,
      TimeWindow.LastSixMonths,
      TimeWindow.LastYear,
    ]}
    selectedTimeRange={timeRange}
    onTimeRangeChanged={onTimeRangeChanged}
  />
);
