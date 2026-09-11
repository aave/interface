import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardContentNoDataProps {
  text: ReactNode;
}

export const DashboardContentNoData = ({ text }: DashboardContentNoDataProps) => {
  return (
    <Box
      sx={{
        px: { xs: 4, xsm: 6 },
        pt: { xs: '0.875rem', xsm: '1.375rem' },
        pb: { xs: '0.875rem', xsm: '1.75rem' },
      }}
    >
      <Typography color="fg-2">{text}</Typography>
    </Box>
  );
};
