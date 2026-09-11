import { Box, Button, PaletteMode, Typography } from '@mui/material';

interface ThemeControlProps {
  mode: PaletteMode;
  onChange: (mode: PaletteMode) => void;
}

// Segmented Light/Dark control for the showcase's local theme. Uses the themed
// Button variants so it reads natively in whichever mode is active.
export const ThemeControl = ({ mode, onChange }: ThemeControlProps) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="helperText" color="fg-2" sx={{ mb: 1, display: 'block' }}>
      Theme
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      {(['light', 'dark'] as const).map((value) => (
        <Button
          key={value}
          variant={mode === value ? 'contained' : 'tertiary'}
          size="small"
          fullWidth
          onClick={() => onChange(value)}
          sx={{ textTransform: 'capitalize' }}
        >
          {value}
        </Button>
      ))}
    </Box>
  </Box>
);
