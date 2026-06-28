import { CheckCircleIcon, QuestionMarkCircleIcon, XCircleIcon } from '@heroicons/react/solid';
import { Box, BoxProps, Typography, TypographyProps, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface CheckBadgeProps extends BoxProps {
  checked?: boolean;
  text: ReactNode;
  variant?: TypographyProps['variant'];
  loading?: boolean;
}

export function CheckBadge({
  checked,
  text,
  variant = 'subheader2',
  loading,
  ...rest
}: CheckBadgeProps) {
  const { palette } = useTheme();
  return (
    <Box {...rest} sx={{ display: 'flex', alignItems: 'center', ...rest.sx }}>
      <Typography variant={variant} component="span" sx={{ mr: 1 }}>
        {text}
      </Typography>
      {loading ? (
        <QuestionMarkCircleIcon height={16} />
      ) : checked ? (
        <CheckCircleIcon height={16} color={palette.success.main} />
      ) : (
        <XCircleIcon height={16} color={palette.error.main} />
      )}
    </Box>
  );
}
