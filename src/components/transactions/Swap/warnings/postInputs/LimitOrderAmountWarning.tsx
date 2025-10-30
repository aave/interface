import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useMemo } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapState } from '../../types';
import { OrderType } from '../../types/shared.types';

export function LimitOrderAmountWarning({ state }: { state: SwapState }) {
  const suggestedSlippage = state.swapRate?.suggestedSlippage;

  const [shouldShowWarning, isHigherDifference, differencePercentage] = useMemo(() => {
    if (state.orderType !== OrderType.LIMIT || !state.swapRate || suggestedSlippage == null) {
      return [false, false];
    }

    // Derive token USD unit prices from current quote (spot)
    const srcUnitAmount = normalizeBN(state.swapRate.srcSpotAmount, state.swapRate.srcDecimals);
    const destUnitAmount = normalizeBN(state.swapRate.destSpotAmount, state.swapRate.destDecimals);
    if (srcUnitAmount.isZero() || destUnitAmount.isZero()) {
      return [false, false];
    }
    const srcUsdPerUnit = valueToBigNumber(state.swapRate.srcSpotUSD || '0').dividedBy(
      srcUnitAmount
    );
    const destUsdPerUnit = valueToBigNumber(state.swapRate.destSpotUSD || '0').dividedBy(
      destUnitAmount
    );
    if (srcUsdPerUnit.isZero() || destUsdPerUnit.isZero()) {
      return [false, false];
    }

    // User-defined amounts converted to USD using spot unit prices
    const userInputUsd = valueToBigNumber(state.inputAmount || '0').multipliedBy(srcUsdPerUnit);
    const userOutputUsd = valueToBigNumber(state.outputAmount || '0').multipliedBy(destUsdPerUnit);

    if (userInputUsd.isZero() || userOutputUsd.isZero()) {
      return [false, false];
    }

    // Apply provider suggested slippage to output side to get a conservative reference
    const slippageFactor = valueToBigNumber(1).minus(
      valueToBigNumber(suggestedSlippage).dividedBy(100)
    );
    const recommendedMinOutputUsd = valueToBigNumber(
      state.swapRate.destSpotUSD || '0'
    ).multipliedBy(slippageFactor);

    // Compute gains vs input in percentage terms
    const userGainPct = userOutputUsd.minus(userInputUsd).dividedBy(userInputUsd).multipliedBy(100);
    const recommendedGainPct = recommendedMinOutputUsd
      .minus(valueToBigNumber(state.swapRate.srcSpotUSD || '0'))
      .dividedBy(valueToBigNumber(state.swapRate.srcSpotUSD || '0'))
      .multipliedBy(100);

    // Positive difference means user is worse than recommended reference
    const diffPct = recommendedGainPct.minus(userGainPct);

    const shouldShow = diffPct.isLessThan(-5); // user's order less favorable than recommended
    const significant = diffPct.isLessThan(-20); // >= 20% worse considered significant

    return [shouldShow, significant, diffPct];
  }, [
    state.orderType,
    state.swapRate?.srcSpotUSD,
    state.swapRate?.destSpotUSD,
    state.swapRate?.srcSpotAmount,
    state.swapRate?.destSpotAmount,
    state.swapRate?.srcDecimals,
    state.swapRate?.destDecimals,
    state.inputAmount,
    state.outputAmount,
    suggestedSlippage,
  ]);

  if (!shouldShowWarning) return null;

  return (
    <Warning
      severity={isHigherDifference ? 'warning' : 'info'}
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
          Your order amounts are {isHigherDifference ? 'significantly ' : ''} less favorable by{' '}
          {differencePercentage?.abs()?.toFixed(1) ?? '0'}% to the liquidity provider than
          recommended. This order may not be executed.
        </Trans>
      </Typography>
    </Warning>
  );
}
