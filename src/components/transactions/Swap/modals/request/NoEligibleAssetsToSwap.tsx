import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

export const NoEligibleAssetsToSwap = () => {
  return (
    <Typography color="text.secondary">
      <Trans>No eligible assets to swap.</Trans>
    </Typography>
  );
};
