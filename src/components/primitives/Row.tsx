import { Box, BoxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface RowProps extends BoxProps {
  caption?: ReactNode;
  captionVariant?: 'secondary16' | 'description' | 'subheader1';
  align?: 'center' | 'flex-start';
}

export const Row = ({
  caption,
  children,
  captionVariant = 'secondary16',
  align = 'center',
  ...rest
}: RowProps) => {
  return (
    <Box
      {...rest}
      sx={{ display: 'flex', alignItems: align, justifyContent: 'space-between', ...rest.sx }}
    >
      {caption && (
        <Typography component="div" variant={captionVariant} sx={{ mr: 2 }}>
          {caption}
        </Typography>
      )}

      {children}
    </Box>
  );
};
