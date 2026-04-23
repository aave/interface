import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapState, SwapType } from '../../types';
import { isProtocolSwapState } from '../../types/state.types';

export function ZeroLTVDestinationWarning({ state }: { state: SwapState }) {
  if (!isProtocolSwapState(state) || state.swapType !== SwapType.CollateralSwap) {
    return null;
  }

  const destinationReserve = state.isInvertedSwap
    ? state.sourceReserve?.reserve
    : state.destinationReserve?.reserve;

  if (!destinationReserve || destinationReserve.baseLTVasCollateral !== '0') {
    return null;
  }

  return (
    <Warning severity="warning" icon={false} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="caption">
        <Trans>
          {destinationReserve.symbol} has a Loan-to-Value of 0, so it will not be enabled as
          collateral automatically after the swap.
        </Trans>
      </Typography>
    </Warning>
  );
}
