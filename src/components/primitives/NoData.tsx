import Typography, { TypographyProps } from '@mui/material/Typography';
import React from 'react';

export const NoData = <C extends React.ElementType>({
  color = 'fg-4',
  ...rest
}: TypographyProps<C, { component?: C }>) => {
  return (
    <Typography color={color} {...rest}>
      —
    </Typography>
  );
};
