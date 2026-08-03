import { Alert, Typography } from '@mui/material';

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
    <Alert severity="warning" icon={false} sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Typography variant="caption">
        You selected a custom imported token. Make sure it&apos;s the right token.
      </Typography>
    </Alert>
  );
}
