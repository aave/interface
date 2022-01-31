import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface ListHeaderWrapperProps {
  px?: 4 | 6;
  children: ReactNode;
}

export const ListHeaderWrapper = ({ px = 4, children }: ListHeaderWrapperProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', px, pt: 4, pb: '6px' }}>{children}</Box>
  );
};
