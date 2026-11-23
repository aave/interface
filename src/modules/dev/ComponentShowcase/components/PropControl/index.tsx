import { Box, Typography } from '@mui/material';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

export const ON_OFF = [
  { value: false, label: 'Off' },
  { value: true, label: 'On' },
] as const;

export const PropControl = <T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <Typography variant="caption" color="fg-3" sx={{ minWidth: '2.5rem' }}>
      {label}
    </Typography>
    <StyledTxModalToggleGroup
      value={value}
      exclusive
      onChange={(_, next: T | null) => next !== null && onChange(next)}
      aria-label={label}
      sx={{ width: 'auto', display: 'inline-grid', gridAutoFlow: 'column', gridAutoColumns: '1fr' }}
    >
      {options.map((option) => (
        <StyledTxModalToggleButton key={String(option.value)} value={option.value} sx={{ px: 2.5 }}>
          <Typography variant="h5" noWrap>
            {option.label}
          </Typography>
        </StyledTxModalToggleButton>
      ))}
    </StyledTxModalToggleGroup>
  </Box>
);
