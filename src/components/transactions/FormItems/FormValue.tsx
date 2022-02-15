import { Box, GridProps } from '@mui/material';
import React from 'react';

export const FormValue: React.FC<GridProps> = (props) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }} {...props} />
);
