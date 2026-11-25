import { TimeWindow } from '@aave/react';
import { Box, ButtonBase } from '@mui/material';
import { motion } from 'src/utils/motion';

const TIME_RANGES: { value: TimeWindow; label: string }[] = [
  { value: TimeWindow.LastDay, label: '1D' },
  { value: TimeWindow.LastWeek, label: '1W' },
  { value: TimeWindow.LastMonth, label: '1M' },
  { value: TimeWindow.LastSixMonths, label: '6M' },
  { value: TimeWindow.LastYear, label: '1Y' },
];

export interface GraphTimeRangeSelectorProps {
  disabled: boolean;
  timeRange: TimeWindow;
  onTimeRangeChanged: (value: TimeWindow) => void;
}

export const GraphTimeRangeSelector = ({
  disabled,
  timeRange,
  onTimeRangeChanged,
}: GraphTimeRangeSelectorProps) => (
  <Box role="group" aria-label="Date range" sx={{ display: 'flex', mr: '0.5rem' }}>
    {TIME_RANGES.map(({ value, label }) => {
      const selected = value === timeRange;
      return (
        <ButtonBase
          key={value}
          disabled={disabled}
          aria-pressed={selected}
          onClick={() => onTimeRangeChanged(value)}
          sx={{
            typography: 'caption',
            px: '0.5625rem',
            py: '0.25rem',
            borderRadius: '0.25rem',
            color: selected ? 'fg-1' : 'fg-5',
            transition: `color ${motion.duration.hover}ms ${motion.easing.standard}`,
            '&:hover': { color: 'fg-1' },
          }}
        >
          {label}
        </ButtonBase>
      );
    })}
  </Box>
);
