import { Box, BoxProps, Divider } from '@mui/material';
import { ReactNode } from 'react';

interface ListItemProps extends BoxProps {
  children: ReactNode;
  minHeight?: 71 | 76;
  px?: 4 | 6;
  button?: boolean;
}

export const ListItem = ({ children, minHeight = 71, px = 4, button, ...rest }: ListItemProps) => {
  return (
    <Box {...rest}>
      <Divider />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight,
          px,
          ...(button ? { '&:hover': { bgcolor: 'action.hover' } } : {}),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
