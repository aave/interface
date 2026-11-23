import { Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface ReserveCardProps {
  title: ReactNode;
  children: ReactNode;
}

export const ReserveCard = ({ title, children }: ReserveCardProps) => (
  <Paper variant="card" sx={{ p: '1.5rem' }}>
    <Typography variant="h3" component="h2">
      {title}
    </Typography>
    {children}
  </Paper>
);
