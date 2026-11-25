import { Trans } from '@lingui/macro';
import { Alert, SxProps } from '@mui/material';
import { ReactNode } from 'react';

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

// Errors the backend orders API returns as plain messages.
const convertBackendOrderErrorMessage = (message: string): ReactNode | undefined => {
  if (/position swaps are not provisioned on market/i.test(message)) {
    return <Trans>This swap is not available on this market yet.</Trans>;
  }
  if (/quote again/i.test(message)) {
    return <Trans>The quote changed before the order was placed. Getting a new quote.</Trans>;
  }
  return undefined;
};

export const ProviderError = ({ error, sx, provider, state }: QuoteErrorProps) => {
  let customErrorMessage: ReactNode | undefined;

  switch (provider) {
    case SwapProvider.PARASWAP:
      customErrorMessage = convertParaswapErrorMessage(error.message);
      break;
    case SwapProvider.COW_PROTOCOL:
      customErrorMessage =
        convertBackendOrderErrorMessage(error.message) ??
        convertCowProtocolErrorMessage(error.message);
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
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      {customErrorMessage}
    </Alert>
  );
};
