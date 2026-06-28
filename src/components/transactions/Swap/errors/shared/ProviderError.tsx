import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapError, SwapProvider, SwapState } from '../../types';
import { convertCowProtocolErrorMessage } from '../cow/quote.helpers';
import { convertParaswapErrorMessage } from '../paraswap/quote.helpers';
import { errorToConsoleString } from '../shared/console.helpers';
import { GenericError } from './GenericError';

interface QuoteErrorProps {
  error: SwapError;
  provider: SwapProvider;
  sx?: SxProps;
  state: SwapState;
}

export const ProviderError = ({ error, sx, provider, state }: QuoteErrorProps) => {
  let customErrorMessage;

  switch (provider) {
    case SwapProvider.PARASWAP:
      customErrorMessage = convertParaswapErrorMessage(error.message);
      break;
    case SwapProvider.COW_PROTOCOL:
      customErrorMessage = convertCowProtocolErrorMessage(error.message);
      break;
    default:
      console.error('No provider error mapping found for', provider, error);
      break;
  }

  if (!customErrorMessage) {
    const errorToCopy = errorToConsoleString(state, error);
    return (
      <GenericError
        message={'There was an unknown error.\n Please share it via our support channels.'}
        copyText={errorToCopy.toString()}
      />
    );
  }

  return (
    <Warning severity="error" icon={false} sx={{ mt: 4, ...sx }}>
      <Typography variant="caption">{customErrorMessage}</Typography>
    </Warning>
  );
};
