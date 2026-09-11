import { Trans } from '@lingui/macro';
import { Alert } from '@mui/material';

export const CowLowerThanMarketWarning = () => {
  return (
    <Alert severity="info" sx={{ mb: 6, width: '100%', mt: 5 }}>
      <Trans>
        The selected rate is lower than the market price. You might incur a loss if you proceed.
      </Trans>
    </Alert>
  );
};
