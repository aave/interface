import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ArrowRightIcon } from 'src/components/icons/ArrowRightIcon';

interface ValueChangeProps {
  current: ReactNode;
  after: ReactNode;
}

export const ValueChange = ({ current, after }: ValueChangeProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
    <Typography variant="h5" color="fg-3" component="div" sx={{ display: 'flex' }}>
      {current}
    </Typography>
    <ArrowRightIcon />
    <Typography variant="h5" color="fg-1" component="div" sx={{ display: 'flex' }}>
      {after}
    </Typography>
  </Box>
);
