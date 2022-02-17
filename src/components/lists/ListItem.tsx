import { Box, BoxProps, Divider } from '@mui/material';
import { ReactNode } from 'react';

interface ListItemProps extends BoxProps {
  children: ReactNode;
  minHeight?: 71 | 76;
  px?: 4 | 6;
}

export const ListItem = ({ children, minHeight = 71, px = 4, ...rest }: ListItemProps) => {
  return (
    <Box {...rest}>
      <Divider />

      <Box sx={{ display: 'flex', alignItems: 'center', minHeight, px }}>{children}</Box>
    </Box>
  );
};
