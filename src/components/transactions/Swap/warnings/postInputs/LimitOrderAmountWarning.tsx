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

    let userOrderAmount, recommendedAfterFees;
    if (state.isInvertedSwap) {
      userOrderAmount = valueToBigNumber(state.inputAmount);
      recommendedAfterFees = normalizeBN(
        state.buyAmountFormatted ?? '0',
        state.buyAmountToken?.decimals ?? 18
      );
    } else {
      userOrderAmount = valueToBigNumber(state.outputAmount);
      recommendedAfterFees = normalizeBN(
        state.buyAmountFormatted ?? '0',
        state.buyAmountToken?.decimals ?? 18
      );
    }

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
