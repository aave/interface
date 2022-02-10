import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid';
import { Box, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface CheckBadgeProps {
  checked?: boolean;
  text: ReactNode;
}

export function CheckBadge({ checked, text }: CheckBadgeProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="subheader2" component="span" sx={{ mr: 1 }}>
        {text}
      </Typography>
      <SvgIcon color="success" fontSize="small">
        {checked ? <CheckCircleIcon /> : <XCircleIcon />}
      </SvgIcon>
    </Box>
  );
}
