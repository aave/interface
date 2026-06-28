import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { SwapState, SwapType } from '../../types';
import { isProtocolSwapState } from '../../types/state.types';

export function ZeroLTVDestinationWarning({ state }: { state: SwapState }) {
  const { user } = useAppDataContext();

  if (!isProtocolSwapState(state) || state.swapType !== SwapType.CollateralSwap) {
    return null;
  }

  const destinationReserve = state.isInvertedSwap
    ? state.sourceReserve?.reserve
    : state.destinationReserve?.reserve;

  if (!destinationReserve) {
    return null;
  }

  // Mirror getUserReserveLtv: an asset has effective non-zero LTV when base LTV > 0,
  // or when the user is in an e-mode where it is collateralEnabled and not ltvzero.
  const toEmode = destinationReserve.eModes?.find((e) => e.id === user?.userEmodeCategoryId);
  const hasEffectiveLtv =
    destinationReserve.baseLTVasCollateral !== '0' ||
    (user?.isInEmode && toEmode?.collateralEnabled && !toEmode.ltvzeroEnabled);

  if (hasEffectiveLtv) {
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
