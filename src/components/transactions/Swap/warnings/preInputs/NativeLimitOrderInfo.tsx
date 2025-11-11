import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapParams, SwapState, SwapType, TokenType } from '../../types';

export function NativeLimitOrderInfo({ state, params }: { state: SwapState; params: SwapParams }) {
  // Classic swaps only; show when input token is native
  const isClassicSwap = params.swapType === SwapType.Swap;
  const isNativeInput = state.sourceToken?.tokenType === TokenType.NATIVE;

  if (!isClassicSwap || !isNativeInput) return null;

  return (
    <Warning severity="info" icon={false} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="caption">
        <Trans>
          For security reasons, limit orders are not supported for Native tokens. To place a limit
          order, use the wrapped version.
        </Trans>
      </Typography>
    </Warning>
  );
}
