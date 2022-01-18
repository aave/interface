import * as React from 'react';
import Typography, { TypographyProps } from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';

export default function Copyright(props: TypographyProps) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <MuiLink color="inherit" href="https://aave.com/">
        Aave
      </MuiLink>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}
