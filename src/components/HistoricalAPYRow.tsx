import { SxProps, Theme, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const supportedHistoricalTimeRangeOptions = ['Now', '30D', '60D', '90D'] as const;

export enum ESupportedAPYTimeRanges {
  Now = 'Now',
  ThirtyDays = '30D',
  SixtyDays = '60D',
  NinetyDays = '90D',
}

export const reserveHistoricalRateTimeRangeOptions = [
  ESupportedAPYTimeRanges.Now,
  ESupportedAPYTimeRanges.ThirtyDays,
  ESupportedAPYTimeRanges.SixtyDays,
  ESupportedAPYTimeRanges.NinetyDays,
];

export type ReserveHistoricalRateTimeRange = typeof reserveHistoricalRateTimeRangeOptions[number];

export interface TimeRangeSelectorProps {
  disabled?: boolean;
  selectedTimeRange: ESupportedAPYTimeRanges;
  onTimeRangeChanged: (value: ESupportedAPYTimeRanges) => void;
  sx?: {
    buttonGroup: SxProps<Theme>;
    button: SxProps<Theme>;
  };
}

export const HistoricalAPYRow = ({
  disabled = false,
  selectedTimeRange,
  onTimeRangeChanged,
  ...props
}: TimeRangeSelectorProps) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: ESupportedAPYTimeRanges
  ) => {
    if (newInterval !== null) {
      onTimeRangeChanged(newInterval);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <Typography variant="secondary14">APY</Typography>
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
        {supportedHistoricalTimeRangeOptions.map((interval) => {
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
    </div>
  );
};
