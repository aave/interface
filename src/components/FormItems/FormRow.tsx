import { Box } from '@mui/material';
import React from 'react';

export const FormRow: React.FC = (props) => (
  <Box sx={{ display: 'flex', alignItems: 'center', height: '32px', my: 1 }} {...props} />
);
