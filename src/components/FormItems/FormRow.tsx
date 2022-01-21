import { Grid } from '@mui/material';
import React from 'react';

export const FormRow: React.FC = (props) => (
  <Grid container item justifyContent="space-between" {...props} />
);
