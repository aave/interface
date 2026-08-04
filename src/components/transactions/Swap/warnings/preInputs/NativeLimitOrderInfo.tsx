import { Trans } from '@lingui/macro';
import { Alert } from '@mui/material';

import { SwapParams, SwapProvider, SwapState, SwapType, TokenType } from '../../types';

export function NativeLimitOrderInfo({ state, params }: { state: SwapState; params: SwapParams }) {
  // Classic swaps only; show when input token is native
  const isClassicSwap = params.swapType === SwapType.Swap;
  const isNativeInput = state.sourceToken?.tokenType === TokenType.NATIVE;
  const isCoWProtocol = state.provider === SwapProvider.COW_PROTOCOL;

  if (!isClassicSwap || !isNativeInput || !isCoWProtocol) return null;

  return (
    <Alert severity="info" data-size="small" sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Trans>
        For security reasons, limit orders are not supported for Native tokens. To place a limit
        order, use the wrapped version.
      </Trans>
    </Alert>
  );
}
