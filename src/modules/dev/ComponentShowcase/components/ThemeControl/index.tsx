import { Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

const MODES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

type Mode = (typeof MODES)[number]['value'];

export const ThemeControl = () => {
  const { mode, setMode } = useColorScheme();

  return (
    <StyledTxModalToggleGroup
      value={mode ?? 'system'}
      exclusive
      onChange={(_, value: Mode | null) => value && setMode(value)}
      aria-label="Theme"
      sx={{ width: 'auto', flexShrink: 0 }}
    >
      {MODES.map(({ value, label }) => (
        <StyledTxModalToggleButton key={value} value={value} sx={{ px: 2.5 }}>
          <Typography variant="h5">{label}</Typography>
        </StyledTxModalToggleButton>
      ))}
    </StyledTxModalToggleGroup>
  );
};
