import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid';
import { Box, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface CheckBadgeProps {
  checked?: boolean;
  text: ReactNode;
}

export function CheckBadge({ checked, text }: CheckBadgeProps) {
  const { palette } = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="subheader2" component="span" sx={{ mr: 1 }}>
        {text}
      </Typography>
      {checked ? (
        <CheckCircleIcon height={16} color={palette.success.main} />
      ) : (
        <XCircleIcon height={16} color={palette.error.main} />
      )}
    </Box>
  );
}
