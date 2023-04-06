import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface ListItemProps extends BoxProps {
  children: ReactNode;
  minHeight?: 68 | 71 | 76;
  px?: 4 | 6;
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
        ...(button ? { '&:hover': { bgcolor: 'action.hover' } } : {}),
        '&:not(:last-child)': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        ...rest.sx,
      }}
    >
      {children}
    </Box>
  );
};
