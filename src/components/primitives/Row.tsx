import { Box, BoxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface RowProps extends BoxProps {
  caption: ReactNode;
}

export const Row = ({ caption, children, ...rest }: RowProps) => {
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...rest.sx }}
      {...rest}
    >
      <Typography component="div" variant="secondary16">
        {caption}
      </Typography>
      {children}
    </Box>
  );
};
