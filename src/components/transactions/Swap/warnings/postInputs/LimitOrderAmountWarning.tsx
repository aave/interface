import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useMemo } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapState } from '../../types';
import { OrderType } from '../../types/shared.types';

export function LimitOrderAmountWarning({ state }: { state: SwapState }) {
  const suggestedSlippage = state.swapRate?.suggestedSlippage;

  const [shouldShowWarning, isHigherDifference] = useMemo(() => {
    if (state.orderType !== OrderType.LIMIT || !state.swapRate || !suggestedSlippage) {
      return [false, false];
    }

    const recommendedAfterFees = normalizeBN(
      state.swapRate.afterFeesAmount,
      state.destinationToken.decimals
    );
    const userOrderAmount = valueToBigNumber(state.outputAmount);

    const differencePercentage = recommendedAfterFees
      .minus(userOrderAmount)
      .dividedBy(recommendedAfterFees)
      .multipliedBy(100);

    const isHigherDifference = differencePercentage
      .minus(valueToBigNumber(suggestedSlippage))
      .isLessThanOrEqualTo(valueToBigNumber('-20'));

    const isSignificantDifference = differencePercentage.isLessThanOrEqualTo(
      valueToBigNumber(suggestedSlippage)
    );

    return [isSignificantDifference, isHigherDifference];
  }, [
    state.orderType,
    state.swapRate,
    state.outputAmount,
    state.inputAmount,
    state.side,
    suggestedSlippage,
  ]);

  if (!shouldShowWarning) return null;

  return (
    <Warning
      severity="warning"
      icon={false}
      sx={{
        mt: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="caption">
        <Trans>
          Your order amounts are {isHigherDifference ? 'significantly ' : ''} less favorable to the
          liquidity provider than recommended. This order may not be executed.
        </Trans>
      </Typography>
    </Warning>
  );
}
