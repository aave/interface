import { Divider, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface ReserveStatsRowProps {
  children: ReactNode;
}

export const ReserveStatsRow = ({ children }: ReserveStatsRowProps) => (
  <Stack
    direction="row"
    divider={<Divider orientation="vertical" flexItem />}
    sx={{
      flexWrap: 'wrap',
      columnGap: { xs: '2rem', xsm: '2.5rem' },
      rowGap: '1.875rem',
    }}
  >
    {children}
  </Stack>
);
