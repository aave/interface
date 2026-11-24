import { Box } from '@mui/material';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { MIGRATION_BANNER } from 'src/modules/v4Migration/utils/copy';
import { V4MigrationBanner } from 'src/modules/v4Migration/V4MigrationBanner';
import { V4MigrationIcon } from 'src/modules/v4Migration/V4MigrationIcon';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

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
    description="V3 → V4 migration prompts with mock data until the backend lands. The title defaults to “Migrate to V4”; the description and stats are whatever the caller passes. Migrate does nothing here."
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
    <Specimen label="Asset page, under Your Position — V4MigrationBanner compact" fullWidth>
      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <V4MigrationBanner
          compact
          description={MIGRATION_BANNER.earnUpTo(
            <FormattedNumber value={0.0486} percent variant="inherit" />
          )}
        />
      </Box>
    </Specimen>
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
