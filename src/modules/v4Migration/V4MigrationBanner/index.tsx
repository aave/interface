import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

import { V4MigrationIcon } from '../V4MigrationIcon';

export interface V4MigrationBannerProps {
  title?: ReactNode;
  description: ReactNode;
  stats?: { label: ReactNode; value: ReactNode }[];
  compact?: boolean;
  onMigrate?: () => void;
}

export const V4MigrationBanner = ({
  title = <Trans>Migrate to V4</Trans>,
  description,
  stats = [],
  compact = false,
  onMigrate,
}: V4MigrationBannerProps) => (
  <Box
    sx={{
      position: 'relative',
      isolation: 'isolate',
      overflow: 'hidden',
      display: 'flex',
      flexWrap: compact ? 'nowrap' : { xs: 'wrap', md: 'nowrap' },
      alignItems: 'center',
      columnGap: compact ? '1rem' : { xs: '1.5rem', md: '3rem', lg: '5rem', xl: '7.5rem' },
      rowGap: '1rem',
      minHeight: compact ? undefined : '5.625rem',
      p: compact ? '1rem' : { xs: '1rem', xsm: '1rem 2rem 1rem 1.5rem' },
      borderRadius: '0.75rem',
      bgcolor: 'table-bg',
      boxShadow: `0 2px 24px 0 ${figVars['migration-banner-shadow']}, 0 0 0 1px ${figVars['migration-banner-ring']}`,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        minWidth: 0,
        flexBasis: compact ? 'auto' : { xs: '100%', md: 'auto' },
      }}
    >
      <V4MigrationIcon />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 0 }}>
        <Typography variant="h3" color="fg-1" sx={compact ? { fontSize: '1rem' } : undefined}>
          {title}
        </Typography>
        <Typography variant="base" color="fg-3" component="div">
          {description}
        </Typography>
      </Box>
    </Box>
    {stats.map(({ label, value }, index) => (
      <Box
        key={index}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <Typography variant="base" color="fg-3" noWrap>
          {label}
        </Typography>
        <Typography variant="h3" color="fg-1" component="div" sx={{ display: 'flex' }}>
          {value}
        </Typography>
      </Box>
    ))}
    <Button
      variant="outlined"
      size="medium"
      onClick={onMigrate}
      sx={{
        flexShrink: 0,
        ml: 'auto',
        width: compact ? 'auto' : { xs: '100%', xsm: 'auto' },
      }}
    >
      <Trans>Migrate</Trans>
    </Button>
  </Box>
);
