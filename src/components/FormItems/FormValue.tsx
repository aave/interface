import { Grid, GridProps } from '@mui/material';
import React from 'react';

export const FormValue: React.FC<GridProps> = (props) => (
  <Grid
    item
    sx={{
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      display: 'flex',
      flexDirection: 'column',
      ...props.sx,
    }}
    xs={8}
    {...props}
  />
);
