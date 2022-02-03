import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from '../primitives/Warning';

export const SupplyCapWarning = () => {
  return (
    <Warning>
      <Typography variant="description" color="black">
        <Trans>You are about to get supply capped. FAQ link</Trans>
      </Typography>
    </Warning>
  );
};
