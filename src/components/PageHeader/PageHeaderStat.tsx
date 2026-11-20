import { Box, Skeleton, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderStatProps {
  label: ReactNode;
  children: ReactNode;
  loading?: boolean;
  gap?: string;
}

/** A single label-over-value stat for `PageHeader` (0.62rem gap between label and value by default). */
export const PageHeaderStat = ({
  label,
  children,
  loading,
  gap = '0.62rem',
}: PageHeaderStatProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap }}>
      <Typography
        variant="description"
        component="div"
        sx={{
          color: 'fg-3',
          lineHeight: '0.875rem',
          letterSpacing: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      {loading ? <Skeleton width={72} height={28} /> : children}
    </Box>
  );
};
