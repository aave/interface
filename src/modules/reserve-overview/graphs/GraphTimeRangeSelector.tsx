import { ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';

const timeRangeOptions = ['1m', '6m', '1y', 'Max'] as const;
export type TimeRange = typeof timeRangeOptions[number];

export interface GraphTimeRangeSelectorProps {
  timeRange: TimeRange;
  handleTimeRangeChanged: (value: TimeRange) => void;
}

export const GraphTimeRangeSelector = ({
  timeRange,
  handleTimeRangeChanged,
}: GraphTimeRangeSelectorProps) => {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newInterval: TimeRange) => {
    if (newInterval !== null) {
      handleTimeRangeChanged(newInterval);
    }
  };

  return (
    <ToggleButtonGroup
      value={timeRange}
      exclusive
      onChange={handleChange}
      aria-label="Date range"
      sx={{
        height: '24px',
        '&.MuiToggleButtonGroup-grouped': {
          borderRadius: 'unset',
        },
      }}
    >
      {timeRangeOptions.map((interval) => {
        return (
          <ToggleButton
            key={interval}
            value={interval}
            sx={(theme) => ({
              '&.MuiToggleButtonGroup-grouped:not(.Mui-selected)': {
                borderRadius: '4px',
                border: '0.5px solid transparent',
              },
              '&.MuiToggleButtonGroup-grouped&.Mui-selected': {
                borderRadius: '4px',
                border: `0.5px solid ${theme.palette.divider}`,
                boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
                backgroundColor: 'background.paper',
              },
            })}
          >
            <Typography variant="buttonM">{interval}</Typography>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};
