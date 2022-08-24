import { ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { useState } from 'react';

const intervals = ['1m', '6m', '1y', 'Max'];

export const GraphTimeRangeSelector = () => {
  const [interval, setInterval] = useState('1m');

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newInterval: string) => {
    setInterval(newInterval);
  };

  return (
    <ToggleButtonGroup
      value={interval}
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
      {intervals.map((interval) => {
        return (
          <ToggleButton
            key={interval}
            value={interval}
            sx={{
              '&.MuiToggleButtonGroup-grouped:not(.Mui-selected)': {
                borderRadius: '4px',
                border: '0.5px solid transparent',
              },
              '&.MuiToggleButtonGroup-grouped&.Mui-selected': {
                borderRadius: '4px',
                border: '0.5px solid rgba(56, 61, 81, 0.12)',
                boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
                backgroundColor: '#FFFFFF',
              },
            }}
          >
            <Typography variant="buttonM">{interval}</Typography>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};
