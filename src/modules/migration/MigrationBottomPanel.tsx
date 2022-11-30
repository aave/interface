// TODO: need fix styles

import { Trans } from '@lingui/macro';
import { ArrowRight, WarningAmberOutlined } from '@mui/icons-material';
import { Box, Button, Checkbox, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { useModalContext } from 'src/hooks/useModal';

interface MigrationBottomPanelProps {
  hfV2Current: string;
  hfV2AfterChange: string;
  hfV3Current: string;
  hfV3AfterChange: string;
}

export const MigrationBottomPanel = ({
  hfV2Current,
  hfV2AfterChange,
  hfV3Current,
  hfV3AfterChange,
}: MigrationBottomPanelProps) => {
  const { openV3Migration } = useModalContext();

  const [isChecked, setIsChecked] = useState(false);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Box sx={{ maxWidth: '50%' }}>
        <Box>
          <Typography>
            <Trans>Migration & Health factor change</Trans>
          </Typography>
          <Typography>
            <Trans>
              Please always be aware of your Health Factor (HF) when partially migrating a position
              and that your rates will be updated to V3 rates.
            </Trans>
          </Typography>
          <Typography>
            <Trans>
              Migrating multiple collaterals and borrowed assets at the same time can be an
              expensive operation and might fail in certain situations. Therefore it’s not
              recommended to migrate positions with more than 5 assets (deposited + borrowed) at the
              same time.
            </Trans>
          </Typography>
          <Typography>
            <Trans>Be mindful of the network congestion and gas prices.</Trans>
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            mb: '12px',
          }}
        >
          <Checkbox checked={isChecked} onChange={() => setIsChecked(!isChecked)} size="small" />
          <Typography variant="description">
            <Trans>I fully understand the risks of migrating.</Trans>
          </Typography>
        </Box>

        <Box>
          <Button onClick={openV3Migration} disabled={!isChecked} variant="surface" size="medium">
            <Typography>
              <Trans>Migrate</Trans>
            </Typography>
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: '20px 30px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="description">
            <Trans>Health factor changes after migration</Trans>
          </Typography>
          <WarningAmberOutlined />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography>
            <Trans>Version 2 HF change</Trans>
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <HealthFactorNumber value={hfV2Current} />
            <ArrowRight />
            <HealthFactorNumber value={hfV2AfterChange} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography>
            <Trans>Version 3 HF change</Trans>
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <HealthFactorNumber value={hfV3Current} />
            <ArrowRight />
            <HealthFactorNumber value={hfV3AfterChange} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
