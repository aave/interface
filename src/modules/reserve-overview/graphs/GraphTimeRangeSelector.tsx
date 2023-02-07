import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ReserveRateTimeRange, reserveRateTimeRangeOptions } from 'src/hooks/useReservesHistory';

export interface GraphTimeRangeSelectorProps {
  disabled?: boolean;
  timeRange: ReserveRateTimeRange;
  handleTimeRangeChanged: (value: ReserveRateTimeRange) => void;
}

export const GraphTimeRangeSelector = ({
  disabled = false,
  timeRange,
  handleTimeRangeChanged,
}: GraphTimeRangeSelectorProps) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: ReserveRateTimeRange
  ) => {
    if (newInterval !== null) {
      handleTimeRangeChanged(newInterval);
    }
  };

  return (
    <ToggleButtonGroup
      disabled={disabled}
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
      {reserveRateTimeRangeOptions.map((interval) => {
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
                backgroundColor: 'background.surface',
              },
              '&.MuiToggleButtonGroup-grouped&.Mui-disabled': {
                color: 'text.disabled',
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
