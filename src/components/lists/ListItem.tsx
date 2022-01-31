import { Box, Divider } from '@mui/material';
import { ReactNode } from 'react';

interface ListItemProps {
  warningComponent?: ReactNode;
  children: ReactNode;
  minHeight?: 71 | 76;
  px?: 4 | 6;
}

export const ListItem = ({ warningComponent, children, minHeight = 71, px = 4 }: ListItemProps) => {
  return (
    <Box>
      <Divider />

      {warningComponent}

      <Box sx={{ display: 'flex', alignItems: 'center', minHeight, px }}>{children}</Box>
    </Box>
  );
};
