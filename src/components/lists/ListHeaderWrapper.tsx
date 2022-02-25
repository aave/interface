import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface ListHeaderWrapperProps extends BoxProps {
  px?: 4 | 6;
  children: ReactNode;
}

export const ListHeaderWrapper = ({ px = 4, children, ...rest }: ListHeaderWrapperProps) => {
  return (
    <Box {...rest} sx={{ display: 'flex', alignItems: 'flex-end', px, pt: 4, pb: 1, ...rest.sx }}>
      {children}
    </Box>
  );
};
