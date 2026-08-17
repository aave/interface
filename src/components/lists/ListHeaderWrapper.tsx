import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface ListHeaderWrapperProps extends BoxProps {
  px?: 4 | 6;
  children: ReactNode;
}

export const ListHeaderWrapper = ({ px = 4, children, ...rest }: ListHeaderWrapperProps) => {
  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1rem',
        px,
        pt: 4,
        pb: 1,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        bgcolor: 'surface-elevated',
        borderBottom: '1px solid',
        borderColor: 'border-0',
        borderTopLeftRadius: 'inherit',
        borderTopRightRadius: 'inherit',
        ...rest.sx,
      }}
    >
      {children}
    </Box>
  );
};
