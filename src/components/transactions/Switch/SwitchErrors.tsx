import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwitchRatesError } from './SwitchRatesError';

interface SwitchErrorsProps {
  ratesError: unknown;
  balance: string;
  inputAmount: string;
  sx?: SxProps;
}

export const SwitchErrors = ({ ratesError, balance, inputAmount, sx }: SwitchErrorsProps) => {
  if (ratesError) {
    return <SwitchRatesError error={ratesError} sx={sx} />;
  } else if (Number(inputAmount) > Number(balance)) {
    return (
      <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
        <Typography variant="caption">
          <Trans>Your balance is lower than the selected amount.</Trans>
        </Typography>
      </Warning>
    );
  }
  return null;
};
