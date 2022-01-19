import MuiLink from '@mui/material/Link';
import Typography, { TypographyProps } from '@mui/material/Typography';
import * as React from 'react';

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
