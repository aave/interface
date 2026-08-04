import { Alert } from '@mui/material';

import { SwapState, TokenType } from '../../types';

export function CustomTokenWarning({ state }: { state: SwapState }) {
  if (
    !(
      state.sourceToken.tokenType === TokenType.USER_CUSTOM ||
      state.destinationToken.tokenType === TokenType.USER_CUSTOM
    )
  ) {
    return null;
  }

  return (
    <Alert severity="warning" data-size="small" sx={{ width: '100%', mt: 2, mb: 2 }}>
      You selected a custom imported token. Make sure it&apos;s the right token.
    </Alert>
  );
}
