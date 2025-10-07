import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapProvider } from '../../types';
import { convertCowProtocolErrorMessage } from '../cow/quote.helpers';
import { convertParaswapErrorMessage } from '../paraswap/quote.helpers';

interface QuoteErrorProps {
  error: Error;
  provider: SwapProvider;
  sx?: SxProps;
}

export const ProviderError = ({ error, sx, provider }: QuoteErrorProps) => {
  let customErrorMessage;

  switch (provider) {
    case SwapProvider.PARASWAP:
      customErrorMessage = convertParaswapErrorMessage(error.message);
      break;
    case SwapProvider.COW_PROTOCOL:
      customErrorMessage = convertCowProtocolErrorMessage(error.message);
      break;
  }

  if (!customErrorMessage) {
    return null;
  }

  return (
    <Warning severity="error" icon={false} sx={{ mt: 4, ...sx }}>
      <Typography variant="caption">{customErrorMessage}</Typography>
    </Warning>
  );
};
