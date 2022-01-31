import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardContentNoDataProps {
  text: ReactNode;
}

export const DashboardContentNoData = ({ text }: DashboardContentNoDataProps) => {
  return (
    <Box sx={{ px: 6, pt: '2px', pb: '18px' }}>
      <Typography color="text.secondary">{text}</Typography>
    </Box>
  );
};
