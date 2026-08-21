import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardContentNoDataProps {
  text: ReactNode;
}

export const DashboardContentNoData = ({ text }: DashboardContentNoDataProps) => {
  return (
    <Box sx={{ px: { xs: 4, xsm: 6 }, pt: { xs: 3.5, xsm: 5.5 }, pb: { xs: 6, sxm: 7 } }}>
      <Typography color="fg-2">{text}</Typography>
    </Box>
  );
};
