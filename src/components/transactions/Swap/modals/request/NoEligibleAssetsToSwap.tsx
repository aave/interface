import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

export const NoEligibleAssetsToSwap = () => {
  return (
    <Typography color="fg-2">
      <Trans>No eligible assets to swap.</Trans>
    </Typography>
  );
};
