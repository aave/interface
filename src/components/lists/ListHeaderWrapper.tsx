import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface ListHeaderWrapperProps extends BoxProps {
  px?: 4 | 5;
  children: ReactNode;
}

export const ListHeaderWrapper = ({ px = 4, children, ...rest }: ListHeaderWrapperProps) => {
  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        px,
        minHeight: '3rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        bgcolor: 'table-bg',
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
