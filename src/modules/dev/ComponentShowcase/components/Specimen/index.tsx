import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

interface SpecimenProps {
  label?: string;
  fullWidth?: boolean;
  // Cross-axis alignment of the controls on the stage row. Defaults to 'center' (best for
  // toggles); pass 'flex-start' when items differ in height (e.g. a field with error text) so
  // their top edges line up.
  align?: 'center' | 'flex-start';
  children: ReactNode;
}

// A single example: a small uppercase caption above the component, which sits on a
// plain bordered "stage" (no fill) — matching the reference showcase.
export const Specimen = ({ label, fullWidth, align = 'center', children }: SpecimenProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: fullWidth ? '1 1 100%' : '0 1 auto',
      minWidth: fullWidth ? '100%' : 200,
    }}
  >
    {label && (
      <Typography
        variant="helperText"
        sx={{
          color: 'fg-3',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
    )}
    <Box
      sx={{
        display: 'flex',
        alignItems: align,
        flexWrap: 'wrap',
        gap: 3,
        p: 6,
        minHeight: 56,
        border: `1px solid ${figVars['border-2']}`,
        borderRadius: '12px',
      }}
    >
      {children}
    </Box>
  </Box>
);
