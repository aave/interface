import { Box, Skeleton } from '@mui/material';
import { ReactNode } from 'react';
import { InfoLabel } from 'src/components/InfoLabel';
import { NoData } from 'src/components/primitives/NoData';

interface StatRowProps {
  label: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  skeleton?: ReactNode;
  children?: ReactNode;
}

export const StatRow = ({
  label,
  icon,
  description,
  loading,
  empty,
  skeleton,
  children,
}: StatRowProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      minHeight: '1.125rem',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}>
      {icon && <Box sx={{ display: 'flex', pr: '0.25rem' }}>{icon}</Box>}
      <InfoLabel label={label} tooltip={description} iconMargin={1} />
    </Box>
    {loading ? (
      skeleton ?? (
        <Skeleton variant="rectangular" width={46} height={12} sx={{ borderRadius: '0.5rem' }} />
      )
    ) : (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.25rem',
          typography: 'h5',
          color: 'fg-1',
          whiteSpace: 'nowrap',
        }}
      >
        {empty ? <NoData /> : children}
      </Box>
    )}
  </Box>
);
