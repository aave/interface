import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { Warning } from '../primitives/Warning';

export const RepayCollateralWarning = () => {
  return (
    <Warning severity="warning" sx={{ '.MuiAlert-message': { p: 0 }, mb: 6 }}>
      <Typography variant="caption">
        <Trans>
          Repay with collateral is experiencing degraded performance which may cause your
          transaction to fail. Consider using another service or add more collateral to avoid
          liquidation.
        </Trans>
      </Typography>
    </Warning>
  );
};
