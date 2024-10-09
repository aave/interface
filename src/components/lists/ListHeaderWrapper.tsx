import { Box, BoxProps, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface ListHeaderWrapperProps extends BoxProps {
  px?: 4 | 6;
  children: ReactNode;
}

export const ListHeaderWrapper = ({ px = 4, children, ...rest }: ListHeaderWrapperProps) => {
  const theme = useTheme();
  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        px,
        pt: 4,
        pb: 1,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        bgcolor: theme.palette.mode === 'dark' ? '#ffffff1f' : '#ffffff45',
        borderBottom: '1px solid',
        borderColor: 'divider',
        ...rest.sx,
      }}
    >
      {children}
    </Box>
  );
};
