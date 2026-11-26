import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { MIGRATION_BANNER } from 'src/modules/v4Migration/utils/copy';
import {
  V4MigrationBanner,
  V4MigrationBannerStat,
} from 'src/modules/v4Migration/V4MigrationBanner';
import { V4MigrationIcon } from 'src/modules/v4Migration/V4MigrationIcon';

import { pct } from '../../utils/migrationMocks';
import { Section } from '../Section';
import { Specimen } from '../Specimen';

const COMPACT_ROW_SX = { display: 'flex', flexWrap: 'wrap', gap: '2rem', width: '100%' } as const;

const COMPACT_CELL_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  flex: '1 1 20rem',
  maxWidth: '400px',
} as const;

interface MockRate {
  stat: Pick<V4MigrationBannerStat, 'label' | 'tooltip'>;
  v3: number;
  v4: number;
}

const EARN_RATE = { stat: MIGRATION_BANNER.earnApy, v3: 0.0162, v4: 0.0214 };
const BORROW_RATE = { stat: MIGRATION_BANNER.borrowApy, v3: 0.0412, v4: 0.0348 };

const COMPACT_VARIANTS: { label: string; description: ReactNode; rates: MockRate[] }[] = [
  { label: 'Earn', description: MIGRATION_BANNER.compact.earn, rates: [EARN_RATE] },
  { label: 'Borrow', description: MIGRATION_BANNER.compact.borrow, rates: [BORROW_RATE] },
  {
    label: 'Earn & Borrow',
    description: MIGRATION_BANNER.compact.earnAndBorrow,
    rates: [{ ...EARN_RATE, v3: 0.0384, v4: 0.0486 }, BORROW_RATE],
  },
];

const statsFor = (rates: MockRate[], withChange: boolean): V4MigrationBannerStat[] =>
  rates.map(({ stat, v3, v4 }) => ({
    ...stat,
    value: pct(v4),
    prevValue: withChange ? pct(v3) : undefined,
  }));

const ICON_STAGE_SX = {
  display: 'grid',
  placeItems: 'center',
  width: '10rem',
  height: '10rem',
  overflow: 'hidden',
  isolation: 'isolate',
  borderRadius: '0.75rem',
  bgcolor: 'table-bg',
} as const;

export const MigrationBannersSection = () => (
  <Section
    title="Migration banners"
    description="V3 → V4 migration prompts with mock data until the backend lands. The title defaults to “Migrate to V4”; the description and stats are whatever the caller passes. The compact card on the asset page shows each stat as a row with an optional ⓘ and an optional V3 → V4 change; the page picks the Earn, Borrow or Earn & Borrow copy and rows from the user's position. Migrate does nothing here."
  >
    <Specimen label="Dashboard, positions to migrate — V4MigrationBanner" fullWidth>
      <Box sx={{ width: '100%' }}>
        <V4MigrationBanner
          description={MIGRATION_BANNER.eligibleDescription(4)}
          stats={[
            {
              label: MIGRATION_BANNER.earnExtra,
              value: <FormattedNumber value={420.69} symbol="USD" variant="inherit" />,
            },
            {
              label: MIGRATION_BANNER.eligibleToMigrate,
              value: <FormattedNumber value={19603.53} symbol="USD" variant="inherit" />,
            },
          ]}
        />
      </Box>
    </Specimen>
    <Specimen label="Dashboard, borrow position — V4MigrationBanner" fullWidth>
      <Box sx={{ width: '100%' }}>
        <V4MigrationBanner
          description={MIGRATION_BANNER.borrowDescription}
          stats={[
            {
              label: MIGRATION_BANNER.apy,
              value: <FormattedNumber value={0.029} percent variant="inherit" />,
            },
            {
              label: MIGRATION_BANNER.healthFactor,
              value: (
                <HealthFactorNumber
                  value="3.16"
                  variant="inherit"
                  withHeart
                  sx={{ color: 'inherit' }}
                />
              ),
            },
          ]}
        />
      </Box>
    </Specimen>
    {COMPACT_VARIANTS.map(({ label, description, rates }) => (
      <Specimen
        key={label}
        label={`Asset page, under Your Position — V4MigrationBanner compact: ${label}`}
        fullWidth
      >
        <Box sx={COMPACT_ROW_SX}>
          {[false, true].map((withChange) => (
            <Box key={String(withChange)} sx={COMPACT_CELL_SX}>
              <Typography variant="caption" color="fg-3">
                {withChange ? 'With the V3 rate: V3 → V4' : 'V4 rate only'}
              </Typography>
              <V4MigrationBanner
                compact
                description={description}
                stats={statsFor(rates, withChange)}
              />
            </Box>
          ))}
        </Box>
      </Specimen>
    ))}
    <Specimen label="Icon — V4MigrationIcon (1× and 3×)">
      <Box sx={ICON_STAGE_SX}>
        <V4MigrationIcon />
      </Box>
      <Box sx={{ ...ICON_STAGE_SX, width: '12rem', height: '12rem' }}>
        <Box sx={{ transform: 'scale(3)' }}>
          <V4MigrationIcon />
        </Box>
      </Box>
    </Specimen>
  </Section>
);
