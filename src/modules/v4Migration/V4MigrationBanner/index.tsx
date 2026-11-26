import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { InfoLabel } from 'src/components/InfoLabel';
import { figVars } from 'src/utils/figmaColors';

import { V4MigrationIcon } from '../V4MigrationIcon';
import { ValueChange } from '../V4MigrationPage/components/ValueChange';

export interface V4MigrationBannerStat {
  label: ReactNode;
  tooltip?: ReactNode;
  value: ReactNode;
  prevValue?: ReactNode;
}

export interface V4MigrationBannerProps {
  title?: ReactNode;
  description: ReactNode;
  stats?: V4MigrationBannerStat[];
  compact?: boolean;
  onMigrate?: () => void;
}

const SURFACE_SX = {
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  borderRadius: '0.75rem',
  bgcolor: 'table-bg',
  boxShadow: `0 2px 24px 0 ${figVars['migration-banner-shadow']}, 0 0 0 1px ${figVars['migration-banner-ring']}`,
} as const;

const BANNER_SX = {
  ...SURFACE_SX,
  display: 'flex',
  flexWrap: { xs: 'wrap', md: 'nowrap' },
  alignItems: 'center',
  columnGap: { xs: '1.5rem', md: '3rem', lg: '5rem', xl: '7.5rem' },
  rowGap: '1rem',
  minHeight: '5.625rem',
  p: { xs: '1rem', xsm: '1rem 2rem 1rem 1.5rem' },
} as const;

const CARD_SX = {
  ...SURFACE_SX,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  p: '1.25rem',
} as const;

const HEADER_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  minWidth: 0,
  flexBasis: { xs: '100%', md: 'auto' },
} as const;

const CARD_HEADER_SX = { ...HEADER_SX, flexBasis: 'auto' } as const;

const TEXT_SX = { display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 0 } as const;

const COMPACT_TITLE_SX = { fontSize: '1rem' } as const;

const BANNER_STAT_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
  flexShrink: 0,
} as const;

const CARD_STAT_SX = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '1rem',
  py: '1.25rem',
  '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'border-0' },
} as const;

const STAT_VALUE_SX = { display: 'flex' } as const;

const BANNER_BUTTON_SX = {
  flexShrink: 0,
  ml: 'auto',
  width: { xs: '100%', xsm: 'auto' },
} as const;

const StatValue = ({ value, prevValue }: Pick<V4MigrationBannerStat, 'value' | 'prevValue'>) => (
  <Typography variant="h3" color="fg-1" component="div" sx={STAT_VALUE_SX}>
    {prevValue != null ? <ValueChange variant="h3" current={prevValue} after={value} /> : value}
  </Typography>
);

export const V4MigrationBanner = ({
  title = <Trans>Migrate to V4</Trans>,
  description,
  stats = [],
  compact = false,
  onMigrate,
}: V4MigrationBannerProps) => {
  const header = (
    <Box sx={compact ? CARD_HEADER_SX : HEADER_SX}>
      <V4MigrationIcon />
      <Box sx={TEXT_SX}>
        <Typography variant="h3" color="fg-1" sx={compact ? COMPACT_TITLE_SX : undefined}>
          {title}
        </Typography>
        <Typography variant="base" color="fg-3" component="div">
          {description}
        </Typography>
      </Box>
    </Box>
  );

  if (compact) {
    return (
      <Box sx={CARD_SX}>
        {header}
        {stats.length ? (
          <Box>
            {stats.map(({ label, tooltip, value, prevValue }, index) => (
              <Box key={index} sx={CARD_STAT_SX}>
                <InfoLabel label={label} tooltip={tooltip} iconMargin={2} />
                <StatValue value={value} prevValue={prevValue} />
              </Box>
            ))}
          </Box>
        ) : null}
        <Button variant="outlined" size="medium" fullWidth onClick={onMigrate}>
          <Trans>Migrate to V4</Trans>
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={BANNER_SX}>
      {header}
      {stats.map(({ label, tooltip, value, prevValue }, index) => (
        <Box key={index} sx={BANNER_STAT_SX}>
          <InfoLabel label={label} tooltip={tooltip} iconMargin={2} />
          <StatValue value={value} prevValue={prevValue} />
        </Box>
      ))}
      <Button variant="outlined" size="medium" onClick={onMigrate} sx={BANNER_BUTTON_SX}>
        <Trans>Migrate</Trans>
      </Button>
    </Box>
  );
};
