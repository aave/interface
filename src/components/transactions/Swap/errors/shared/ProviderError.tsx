import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

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
  const { readOnlyMode } = useWeb3Context();
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
    if (readOnlyMode) {
      return (
        <GenericError message="This transaction is not possible in watch wallet mode. Please leave watch wallet mode and connect a wallet." />
      );
    }

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
