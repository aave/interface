import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const CowLowerThanMarketWarning = () => {
  return (
    <Warning severity="info" sx={{ mt: 5 }}>
      <Typography variant="caption">
        <Trans>
          The selected rate is lower than the market price. You might incur a loss if you proceed.
        </Trans>
      </Typography>
    </Warning>
  );
};
