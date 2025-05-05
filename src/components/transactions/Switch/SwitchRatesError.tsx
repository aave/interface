import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { convertParaswapErrorMessage } from 'src/hooks/paraswap/common';

import { convertCowProtocolErrorMessage } from './cowprotocol.errors';

interface SwitchRatesErrorProps {
  error: unknown;
}

export const SwitchRatesError = ({ error }: SwitchRatesErrorProps) => {
  const customErrorMessage =
    error instanceof Error
      ? convertParaswapErrorMessage(error.message) ?? convertCowProtocolErrorMessage(error.message)
      : 'There was an issue fetching rates.';

  return (
    <Warning severity="error" icon={false} sx={{ mt: 4 }}>
      <Typography variant="caption">{customErrorMessage}</Typography>
    </Warning>
  );
};
