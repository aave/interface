import Typography, { TypographyProps } from '@mui/material/Typography';
import React from 'react';

export const NoData = <C extends React.ElementType>({
  color = 'fg-3',
  variant = 'h5',
  noWrap = true,
  ...rest
}: TypographyProps<C, { component?: C }>) => {
  return (
    <Typography color={color} variant={variant} noWrap={noWrap} {...rest}>
      —
    </Typography>
  );
};
