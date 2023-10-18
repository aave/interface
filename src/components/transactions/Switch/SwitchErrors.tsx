import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { ParaswapRatesError } from './ParaswapRatesError';

interface SwitchErrorsProps {
  ratesError: unknown;
  balance: string;
  inputAmount: string;
}

export const SwitchErrors = ({ ratesError, balance, inputAmount }: SwitchErrorsProps) => {
  if (ratesError) {
    return <ParaswapRatesError error={ratesError} />;
  } else if (Number(inputAmount) > Number(balance)) {
    return (
      <Warning severity="error" sx={{ mt: 4 }} icon={false}>
        <Typography variant="caption">
          <Trans>Your balance is lower than the selected amount.</Trans>
        </Typography>
      </Warning>
    );
  }
  return null;
};
