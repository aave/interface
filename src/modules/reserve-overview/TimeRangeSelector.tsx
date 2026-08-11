import { TimeWindow } from '@aave/react';
import { SxProps, Theme, Typography } from '@mui/material';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

export const supportedTimeRangeOptions = ['1m', '3m', '6m', '1y'] as const;

export enum ESupportedTimeRanges {
  OneWeek = '1w',
  OneMonth = '1m',
  ThreeMonths = '3m',
  SixMonths = '6m',
  OneYear = '1y',
  TwoYears = '2y',
  FiveYears = '5y',
}

export interface TimeRangeSelectorProps {
  disabled?: boolean;
  timeRanges: TimeWindow[];
  selectedTimeRange: TimeWindow;
  onTimeRangeChanged: (value: TimeWindow) => void;
  sx?: {
    buttonGroup: SxProps<Theme>;
    button: SxProps<Theme>;
  };
}

const formattedInterval = (interval: TimeWindow) => {
  switch (interval) {
    case TimeWindow.LastWeek:
      return '1w';
    case TimeWindow.LastMonth:
      return '1m';
    case TimeWindow.LastSixMonths:
      return '6m';
    case TimeWindow.LastYear:
      return '1y';
  }
};

export const TimeRangeSelector = ({
  disabled = false, // support default fallback
  timeRanges,
  selectedTimeRange,
  onTimeRangeChanged,
  ...props
}: TimeRangeSelectorProps) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newInterval: TimeWindow) => {
    if (newInterval !== null) {
      // Invoke callback
      onTimeRangeChanged(newInterval);
    }
  };

  return (
    <StyledTxModalToggleGroup
      disabled={disabled}
      value={selectedTimeRange}
      exclusive
      onChange={handleChange}
      aria-label="Date range"
      // Compact chart-header footprint; the shell/pill treatment comes from the shared control.
      sx={{ height: '24px', width: 'auto', ...props.sx?.buttonGroup }}
    >
      {timeRanges.map((interval) => (
        <StyledTxModalToggleButton key={interval} value={interval} sx={props.sx?.button}>
          <Typography variant="buttonM">{formattedInterval(interval)}</Typography>
        </StyledTxModalToggleButton>
      ))}
    </StyledTxModalToggleGroup>
  );
};
