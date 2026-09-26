import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

// A titled sub-group within a section — a full-width band with a subheader and a wrapping
// row of specimens (mirrors the grouping used in ColorsSection).
export const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box sx={{ flex: '1 1 100%', mb: 8 }}>
    <Typography variant="subheader1" sx={{ mb: 4, display: 'block' }}>
      {title}
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 6 }}>
      {children}
    </Box>
  </Box>
);
