import { Box } from '@mui/material';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
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
          description="You have positions across 4 markets eligible to migrate for improved rates and additional features"
          stats={[
            {
              label: 'Earn an extra',
              value: <FormattedNumber value={420.69} symbol="USD" variant="inherit" />,
            },
            {
              label: 'Eligible to Migrate',
              value: <FormattedNumber value={19603.53} symbol="USD" variant="inherit" />,
            },
          ]}
        />
      </Box>
    </Specimen>
    <Specimen label="Dashboard, borrow position — V4MigrationBanner" fullWidth>
      <Box sx={{ width: '100%' }}>
        <V4MigrationBanner
          description="Move your positions to V4 for better rates and more ways to supply and borrow."
          stats={[
            {
              label: 'APY',
              value: <FormattedNumber value={0.029} percent variant="inherit" />,
            },
            {
              label: 'Health Factor',
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
          description={
            <>
              Earn up to <FormattedNumber value={0.0486} percent variant="inherit" /> APY
            </>
          }
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
