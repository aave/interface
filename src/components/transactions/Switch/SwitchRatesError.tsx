import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { convertParaswapErrorMessage } from 'src/hooks/paraswap/common';

import { convertCowProtocolErrorMessage } from './cowprotocol.errors';

interface SwitchRatesErrorProps {
  error: unknown;
}

export const SwitchRatesError = ({ error }: SwitchRatesErrorProps) => {
  let paraswapMessage;
  let cowProtocolMessage;

  if (error instanceof Error) {
    paraswapMessage = convertParaswapErrorMessage(error.message);

    if (!paraswapMessage) {
      cowProtocolMessage = convertCowProtocolErrorMessage(error.message);
    }
  }

  const customErrorMessage =
    error instanceof Error
      ? paraswapMessage ?? cowProtocolMessage ?? error.message
      : 'There was an issue fetching rates.';

  return (
    <Warning severity="error" icon={false} sx={{ mt: 4 }}>
      <Typography variant="caption">{customErrorMessage}</Typography>
    </Warning>
  );
};
