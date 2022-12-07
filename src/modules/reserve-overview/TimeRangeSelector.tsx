import { SxProps, Theme, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

export const supportedTimeRangeOptions = ['1m', '3m', '6m', '1y'] as const;

export enum ESupportedTimeRanges {
  OneMonth = '1m',
  ThreeMonths = '3m',
  SixMonths = '6m',
  OneYear = '1y',
  TwoYears = '2y',
  FiveYears = '5y',
}

interface TimeRangeSelectorProps {
  disabled?: boolean;
  timeRanges: ESupportedTimeRanges[];
  selectedTimeRange: ESupportedTimeRanges;
  onTimeRangeChanged: (value: ESupportedTimeRanges) => void;
  sx?: {
    buttonGroup: SxProps<Theme>;
    button: SxProps<Theme>;
  };
}

export const TimeRangeSelector = ({
  disabled = false, // support default fallback
  timeRanges,
  selectedTimeRange,
  onTimeRangeChanged,
  ...props
}: TimeRangeSelectorProps) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: ESupportedTimeRanges
  ) => {
    if (newInterval !== null) {
      // Invoke callback
      onTimeRangeChanged(newInterval);
    }
  };

  return (
    <ToggleButtonGroup
      disabled={disabled}
      value={selectedTimeRange}
      exclusive
      onChange={handleChange}
      aria-label="Date range"
      sx={{
        height: '24px',
        '&.MuiToggleButtonGroup-grouped': {
          borderRadius: 'unset',
        },
        ...props.sx?.buttonGroup,
      }}
    >
      {timeRanges.map((interval) => {
        return (
          <ToggleButton
            key={interval}
            value={interval}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sx={(theme): SxProps<Theme> | undefined => ({
              '&.MuiToggleButtonGroup-grouped:not(.Mui-selected), &.MuiToggleButtonGroup-grouped&.Mui-disabled':
                {
                  border: '0.5px solid transparent',
                  backgroundColor: 'background.surface',
                  color: 'action.disabled',
                },
              '&.MuiToggleButtonGroup-grouped&.Mui-selected': {
                borderRadius: '4px',
                border: `0.5px solid ${theme.palette.divider}`,
                boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
                backgroundColor: 'background.paper',
              },
              ...props.sx?.button,
            })}
          >
            <Typography variant="buttonM">{interval}</Typography>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};
