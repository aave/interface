import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface ReserveStatProps {
  label: ReactNode;
  ring?: ReactNode;
  children: ReactNode;
}

export const ReserveStat = ({ label, ring, children }: ReserveStatProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 0 }}>
    <Typography
      variant="description"
      color="fg-3"
      component="div"
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      {label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      {ring}
      <Box sx={{ minWidth: 0, '& .MuiTypography-h2': { lineHeight: '2rem' } }}>{children}</Box>
    </Box>
  </Box>
);
