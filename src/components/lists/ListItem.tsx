import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface ListItemProps extends BoxProps {
  children: ReactNode;
  minHeight?: number;
  px?: number;
  button?: boolean;
}

export const ListItem = ({ children, minHeight = 71, px = 4, button, ...rest }: ListItemProps) => {
  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight,
        px,
        '&:not(:last-child)': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        ...(button ? { '&:hover': { bgcolor: 'action.hover' } } : {}),
        ...rest.sx,
      }}
    >
      {children}
    </Box>
  );
};
