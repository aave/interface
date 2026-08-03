import { Trans } from '@lingui/macro';
import { Alert, Typography } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';

import { SwapState } from '../../types';
import { SwapProvider, SwapType } from '../../types/shared.types';

export function CowAdapterApprovalInfo({ state }: { state: SwapState }) {
  const { approvalTxState } = useModalContext();

  const isCow = state.provider === SwapProvider.COW_PROTOCOL;
  const isAdapterFlow =
    state.swapType === SwapType.CollateralSwap ||
    state.swapType === SwapType.DebtSwap ||
    state.swapType === SwapType.RepayWithCollateral;
  const isFlashloan = state.useFlashloan;

  if (!isCow || !isAdapterFlow || approvalTxState?.success || !isFlashloan) return null;

  return (
    <Alert severity="info" icon={false} sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Typography variant="caption">
        <Trans>
          A temporary contract will be used to execute the trade. Your wallet may show a warning for
          approving a new or empty address.
        </Trans>
      </Typography>
    </Alert>
  );
}
